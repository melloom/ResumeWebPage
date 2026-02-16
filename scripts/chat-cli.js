#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

loadEnvFromFile('.env.local');

const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY (or VITE_OPENAI_API_KEY) in .env.local');
  process.exit(1);
}

async function gitDiffSafe(relativePath) {
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to diff outside repo root');
  const rel = path.relative(repoRoot, abs);
  const output = await runCommandSafe(`git diff -- ${rel}`);
  return output.trim();
}

function grepRegexSafe(regexInput, relativePath, limit = 200) {
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to search outside repo root');
  if (!fs.existsSync(abs)) throw new Error(`Not found: ${relativePath}`);

  const rx = buildRegex(regexInput);
  const hits = [];

  function walk(p) {
    if (hits.length >= limit) return;
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      const name = path.basename(p);
      if (['node_modules', '.git', 'dist'].includes(name)) return;
      for (const child of fs.readdirSync(p)) {
        walk(path.join(p, child));
        if (hits.length >= limit) break;
      }
    } else if (stat.isFile()) {
      const rel = path.relative(repoRoot, p);
      let content;
      try {
        content = fs.readFileSync(p, 'utf8');
      } catch (e) {
        return;
      }
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (hits.length >= limit) return;
        if (rx.test(line)) {
          hits.push(`${rel}:${idx + 1}: ${line.trim()}`);
          rx.lastIndex = 0;
        }
      });
    }
  }

  walk(abs);
  return hits;
}

function buildRegex(input) {
  // supports /pat/flags or plain string (case-insensitive by default)
  const regexMatch = input.match(/^\/(.*)\/(\w*)$/);
  if (regexMatch) {
    return new RegExp(regexMatch[1], regexMatch[2]);
  }
  return new RegExp(input, 'i');
}

function printHelp() {
  console.log(`Commands:
  :help                 Show this help
  :system <text>        Set system prompt (empty to clear)
  :model <name>|list    Switch model or list current/choices
  :temp <0-2>           Set temperature (default env OPENAI_TEMP or 0.7)
  :reset                Clear history and system prompt
  :ls [path]            List directory (repo root only)
  :read <path>          Print file (repo root only)
  :write <path>         Write file (end with .end)
  :replace <path>       Replace text once (old then new, each end with .end)
  :patch <path>         Replace whole file (end with .end)
  :mpatch <path> [--dryrun] [--hunk N[,M]]  Multi-hunk patch: hunks separated by ===, old/new separated by --- (end with .end)
  :lint                 Run npm run lint
  :test                 Run npm test (or npm run test)
  :type                 Run npm run typecheck or npx tsc --noEmit if available
  :run <cmd>            Run shell command (repo root, timeout 15s)
  :run! <cmd>           Run whitelisted shell cmd (repo root, timeout 15s)
  :find "text" [path]   Text search (up to 200 hits)
  :grep "regex" [path]  Regex search, ignore node_modules/.git/dist (up to 200 hits)
  :rip "regex" [path]   List files with matches (ignores node_modules/.git/dist)
  :context <path>       Inject file content into chat context
  :autoctx "regex" [path] [n]  Inject top n regex matches into context (default 5)
  :autoctx "regex" [path] [--top N] [--chars M]  Inject with limits
  :show <path> [s:e]    Show file slice with line numbers
  :show <path> [s:e] --context k  Include k lines of context around range
  :head <path> [n]      Show first n lines (default 20)
  :tail <path> [n]      Show last n lines (default 20)
  :diff <path>          Show git diff for path (working tree)
  :diffall              Show git diff of working tree
  :gst                  git status -sb
  :log [n]              Show last n turns (or all)
  :export <path>        Export context (system/model/history) to file
  :undo <path>          Restore last backup for file (this session)
  :savectx <name>       Save chat+system context under name
  :loadctx <name>       Load saved context
  :clearctx             Clear saved contexts
  Plain text               Send chat message with history + streaming
`);
}

const model = process.env.OPENAI_MODEL || process.env.VITE_OPENAI_MODEL || 'gpt-4.1-mini';
let currentModel = model;
let currentTemp = process.env.OPENAI_TEMP ? Number(process.env.OPENAI_TEMP) : 0.7;
const client = new OpenAI({ apiKey });

const repoRoot = process.cwd();
let systemPrompt = null;
const backups = new Map(); // Map<absPath, string[]>

async function streamChat(messages) {
  const fullMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const stream = await client.chat.completions.create({
    model: currentModel,
    messages: fullMessages,
    stream: true,
    temperature: currentTemp,
  });

  let assistantText = '';
  for await (const chunk of stream) {
    const delta = chunk?.choices?.[0]?.delta?.content;
    if (!delta) continue;
    const text = Array.isArray(delta)
      ? delta
          .filter((part) => typeof part.text === 'string' || typeof part === 'string')
          .map((part) => (typeof part === 'string' ? part : part.text))
          .join('')
      : delta;
    if (text) {
      assistantText += text;
      process.stdout.write(text);
    }
  }
  process.stdout.write('\n');
  return assistantText.trim();
}

async function runOnce(prompt) {
  if (!prompt) {
    console.error('Usage: ./scripts/chat-cli.js "your question here"  (or pipe text to stdin)');
    process.exit(1);
  }
  await streamChat([{ role: 'user', content: prompt }]);
}

async function runRepl() {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
  const history = [];
  const savedContexts = new Map();

  console.log('Interactive mode. Ctrl+C to exit. Type :help for commands.');
  rl.prompt();

  rl.on('line', async (line) => {
    const userMsg = line.trim();
    if (!userMsg) {
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':autoctx ')) {
      const tokens = userMsg.slice(9).trim().split(/\s+/);
      let rxRaw = null;
      let pathPart = '.';
      let topN = 5;
      let maxChars = 4000;

      if (tokens.length) {
        rxRaw = tokens.shift();
      }
      // parse flags
      const restTokens = [];
      while (tokens.length) {
        const tok = tokens.shift();
        if (tok === '--top') {
          const val = tokens.shift();
          if (val && /^\d+$/.test(val)) topN = parseInt(val, 10);
        } else if (tok === '--chars') {
          const val = tokens.shift();
          if (val && /^\d+$/.test(val)) maxChars = parseInt(val, 10);
        } else {
          restTokens.push(tok);
        }
      }
      if (restTokens.length) {
        pathPart = restTokens.join(' ');
      }

      if (!rxRaw) {
        console.error('Usage: :autoctx "<regex>" [path] [--top N] [--chars M]');
        rl.prompt();
        return;
      }
      try {
        const hits = grepRegexSafe(rxRaw, pathPart || '.', topN * 5); // grab extra to trim by chars
        if (!hits.length) {
          console.log('(no matches)');
        } else {
          const trimmed = [];
          let remaining = maxChars;
          for (const h of hits) {
            if (trimmed.length >= topN) break;
            if (remaining <= 0) break;
            const chunk = h.slice(0, remaining);
            trimmed.push(chunk);
            remaining -= chunk.length + 1;
          }
          const payload = trimmed.join('\n');
          history.push({ role: 'system', content: `Context from :autoctx ${pathPart} pattern ${rxRaw}:\n${payload}` });
          console.log(`Injected ${trimmed.length} matches into context (limit ${maxChars} chars).`);
        }
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    // Local commands
    if (userMsg === ':help') {
      printHelp();
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':model ')) {
      const arg = userMsg.slice(7).trim();
      if (arg === 'list' || arg === '') {
        console.log(`Current model: ${currentModel}`);
        console.log(`Default (env): ${model}`);
        rl.prompt();
        return;
      }
      currentModel = arg;
      console.log(`Model set to ${currentModel}`);
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':temp ')) {
      const arg = userMsg.slice(6).trim();
      const t = Number(arg);
      if (Number.isNaN(t) || t < 0 || t > 2) {
        console.error('Usage: :temp <0-2>');
        rl.prompt();
        return;
      }
      currentTemp = t;
      console.log(`Temperature set to ${currentTemp}`);
      rl.prompt();
      return;
    }

    if (userMsg === ':reset') {
      history.length = 0;
      systemPrompt = null;
      console.log('History and system prompt cleared.');
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':system ')) {
      systemPrompt = userMsg.slice(8).trim() || null;
      console.log(systemPrompt ? 'System prompt set.' : 'System prompt cleared.');
      rl.prompt();
      return;
    }

    if (userMsg === ':ls' || userMsg.startsWith(':ls ')) {
      const target = userMsg === ':ls' ? '.' : userMsg.slice(4).trim();
      try {
        const entries = listDirSafe(target);
        entries.forEach((e) => console.log(e));
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':read ')) {
      const target = userMsg.slice(6).trim();
      try {
        const content = readFileSafe(target);
        console.log(content);
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':write ')) {
      const target = userMsg.slice(7).trim();
      if (!target) {
        console.error('Usage: :write relative/path.txt  (then type lines, finish with .end on its own line)');
        rl.prompt();
        return;
      }
      console.log('Enter content. Finish with a single line: .end');
      captureMultiline(rl, async (body) => {
        try {
          writeFileSafe(target, body);
          console.log(`Wrote ${target}`);
        } catch (err) {
          console.error(err.message);
        }
        rl.prompt();
      });
      return;
    }

    if (userMsg.startsWith(':patch ')) {
      const target = userMsg.slice(7).trim();
      if (!target) {
        console.error('Usage: :patch relative/path.ext  (then paste full file, end with .end)');
        rl.prompt();
        return;
      }
      console.log('Paste full replacement content. Finish with .end');
      captureMultiline(rl, async (body) => {
        try {
          writeFileSafe(target, body);
          console.log(`Patched ${target}`);
        } catch (err) {
          console.error(err.message);
        }
        rl.prompt();
      });
      return;
    }

    if (userMsg.startsWith(':replace ')) {
      const target = userMsg.slice(9).trim();
      if (!target) {
        console.error('Usage: :replace relative/path.ext  (old text then new text, each ends with .end)');
        rl.prompt();
        return;
      }
      console.log('Enter OLD text to replace. Finish with .end');
      captureMultiline(rl, (oldText) => {
        console.log('Enter NEW text. Finish with .end');
        captureMultiline(rl, (newText) => {
          try {
            replaceOnceSafe(target, oldText, newText);
            console.log(`Replaced text in ${target}`);
          } catch (err) {
            console.error(err.message);
          }
          rl.prompt();
        });
      });
      return;
    }

    if (userMsg.startsWith(':mpatch ')) {
      const parts = userMsg.slice(8).trim().split(/\s+/);
      const target = parts.shift();
      let dryrun = false;
      let hunkFilter = null;
      while (parts.length) {
        const tok = parts.shift();
        if (tok === '--dryrun') dryrun = true;
        else if (tok === '--hunk') {
          const val = parts.shift();
          if (val) hunkFilter = val.split(',').map((x) => parseInt(x, 10)).filter((x) => !Number.isNaN(x));
        }
      }
      if (!target) {
        console.error('Usage: :mpatch <path> [--dryrun] [--hunk N[,M]]');
        rl.prompt();
        return;
      }
      console.log('Paste hunks. Format: OLD then --- then NEW per hunk. Separate hunks with ===. End with .end');
      captureMultiline(rl, (body) => {
        try {
          const result = applyMultiPatchSafe(target, body, { dryrun, hunkFilter });
          if (dryrun) {
            console.log('Dryrun preview:\n' + result.preview);
          } else {
            console.log(`Applied ${result.applied} hunks to ${target}`);
          }
        } catch (err) {
          console.error(err.message);
        }
        rl.prompt();
      });
      return;
    }

    if (userMsg === ':lint') {
      try {
        const output = await runCommandSafe('npm run lint');
        console.log(output || '(no output)');
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg === ':test') {
      try {
        const output = await runCommandSafe('npm test');
        if (/missing script/i.test(output)) {
          const alt = await runCommandSafe('npm run test');
          console.log(alt || '(no output)');
        } else {
          console.log(output || '(no output)');
        }
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg === ':type') {
      try {
        let output;
        try {
          output = await runCommandSafe('npm run typecheck');
        } catch (e) {
          output = await runCommandSafe('npx tsc --noEmit');
        }
        console.log(output || '(no output)');
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':run ')) {
      const cmd = userMsg.slice(5).trim();
      if (!cmd) {
        console.error('Usage: :run <shell command>');
        rl.prompt();
        return;
      }
      try {
        const result = await runCommandSafe(cmd);
        console.log(result || '(no output)');
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':run! ')) {
      const cmd = userMsg.slice(6).trim();
      if (!cmd) {
        console.error('Usage: :run! <whitelisted shell command>');
        rl.prompt();
        return;
      }
      try {
        const result = await runCommandRestricted(cmd);
        console.log(result || '(no output)');
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':find ')) {
      const queryAndPath = userMsg.slice(6).trim();
      const [q, ...rest] = queryAndPath.split(/\s+/);
      const target = rest.join(' ').trim() || '.';
      if (!q) {
        console.error('Usage: :find <text> [path]');
        rl.prompt();
        return;
      }
      try {
        const hits = findTextSafe(q, target, 200);
        if (!hits.length) console.log('(no matches)');
        hits.forEach((h) => console.log(h));
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':grep ')) {
      const parts = userMsg.slice(6).trim().split(/\s+/);
      const rxRaw = parts.shift();
      if (!rxRaw) {
        console.error('Usage: :grep "<regex>" [path] [--json]');
        rl.prompt();
        return;
      }
      const isJson = parts.includes('--json');
      const pathPart = parts.filter((p) => p !== '--json').join(' ').trim() || '.';
      try {
        const hits = grepRegexSafe(rxRaw, pathPart, 200);
        if (!hits.length) {
          console.log('(no matches)');
        } else if (isJson) {
          console.log(JSON.stringify(hits, null, 2));
        } else {
          hits.forEach((h) => console.log(h));
        }
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':rip ')) {
      const parts = userMsg.slice(5).trim().split(/\s+/);
      const rxRaw = parts.shift();
      if (!rxRaw) {
        console.error('Usage: :rip "<regex>" [path] --files');
        rl.prompt();
        return;
      }
      const pathPart = parts.join(' ').trim() || '.';
      try {
        const files = ripFilesSafe(rxRaw, pathPart, 200);
        if (!files.length) console.log('(no matches)');
        else files.forEach((f) => console.log(f));
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':context ')) {
      const target = userMsg.slice(9).trim();
      try {
        const content = readFileSafe(target);
        history.push({ role: 'system', content: `File ${target}:\n${content}` });
        console.log(`Injected ${target} into context.`);
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':show ')) {
      const rest = userMsg.slice(6).trim();
      const [pathPart, ...restParts] = rest.split(/\s+/);
      if (!pathPart) {
        console.error('Usage: :show <path> [start:end]');
        rl.prompt();
        return;
      }
      let rangePart = null;
      let contextLines = 0;
      if (restParts.length) {
        const maybeRange = restParts[0];
        if (/^\d*: ?\d*$/.test(maybeRange) || /^\d+:\d+$/.test(maybeRange)) {
          rangePart = restParts.shift();
        }
        if (restParts[0] === '--context' && restParts[1]) {
          contextLines = parseInt(restParts[1], 10) || 0;
        }
      }
      try {
        const output = showFileSliceSafe(pathPart, rangePart, contextLines);
        console.log(output || '(no content)');
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':head ')) {
      const rest = userMsg.slice(6).trim();
      const [pathPart, nStr] = rest.split(/\s+/, 2);
      const n = nStr ? parseInt(nStr, 10) : 20;
      if (!pathPart) {
        console.error('Usage: :head <path> [n]');
        rl.prompt();
        return;
      }
      try {
        const output = showFileSliceSafe(pathPart, `1:${n}`, 0);
        console.log(output || '(no content)');
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':tail ')) {
      const rest = userMsg.slice(6).trim();
      const [pathPart, nStr] = rest.split(/\s+/, 2);
      const n = nStr ? parseInt(nStr, 10) : 20;
      if (!pathPart) {
        console.error('Usage: :tail <path> [n]');
        rl.prompt();
        return;
      }
      try {
        const output = tailFileSafe(pathPart, n);
        console.log(output || '(no content)');
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':diff ')) {
      const target = userMsg.slice(6).trim();
      if (!target) {
        console.error('Usage: :diff <path>');
        rl.prompt();
        return;
      }
      try {
        const diff = await gitDiffSafe(target);
        console.log(diff || '(no diff)');
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg === ':diffall') {
      try {
        const diff = await runCommandSafe('git diff');
        console.log(diff || '(no diff)');
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg === ':gst') {
      try {
        const out = await runCommandSafe('git status -sb');
        console.log(out || '(clean)');
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':log')) {
      const parts = userMsg.split(/\s+/);
      const n = parts[1] ? parseInt(parts[1], 10) : null;
      const lines = formatHistory(history, systemPrompt, currentModel, n);
      console.log(lines || '(empty history)');
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':export ')) {
      const target = userMsg.slice(8).trim();
      if (!target) {
        console.error('Usage: :export <path>');
        rl.prompt();
        return;
      }
      try {
        const payload = formatHistory(history, systemPrompt, currentModel, null, true);
        writeFileSafe(target, payload, { skipBackup: true });
        console.log(`Exported context to ${target}`);
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':undo ')) {
      const target = userMsg.slice(6).trim();
      if (!target) {
        console.error('Usage: :undo <path>');
        rl.prompt();
        return;
      }
      try {
        undoFileSafe(target);
        console.log(`Undid last change for ${target}`);
      } catch (err) {
        console.error(err.message);
      }
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':savectx ')) {
      const name = userMsg.slice(9).trim();
      if (!name) {
        console.error('Usage: :savectx <name>');
        rl.prompt();
        return;
      }
      savedContexts.set(name, {
        history: [...history],
        systemPrompt,
        model: currentModel,
      });
      console.log(`Saved context '${name}'.`);
      rl.prompt();
      return;
    }

    if (userMsg.startsWith(':loadctx ')) {
      const name = userMsg.slice(9).trim();
      if (!name) {
        console.error('Usage: :loadctx <name>');
        rl.prompt();
        return;
      }
      const ctx = savedContexts.get(name);
      if (!ctx) {
        console.error(`No saved context '${name}'.`);
        rl.prompt();
        return;
      }
      history.length = 0;
      ctx.history.forEach((m) => history.push({ ...m }));
      systemPrompt = ctx.systemPrompt || null;
      currentModel = ctx.model || currentModel;
      console.log(`Loaded context '${name}'. Model now ${currentModel}.`);
      rl.prompt();
      return;
    }

    if (userMsg === ':clearctx') {
      savedContexts.clear();
      console.log('Saved contexts cleared.');
      rl.prompt();
      return;
    }

    history.push({ role: 'user', content: userMsg });
    try {
      const assistantReply = await streamChat(history);
      history.push({ role: 'assistant', content: assistantReply });
    } catch (error) {
      console.error(error.response?.data ?? error.message ?? error);
    }
    rl.prompt();
  });

  rl.on('close', () => process.exit(0));
}

async function main() {
  const argPrompt = process.argv.slice(2).join(' ').trim();
  const hasStdin = !process.stdin.isTTY;

  if (!argPrompt && process.stdin.isTTY) {
    await runRepl();
    return;
  }

  let prompt = argPrompt;
  if (!prompt && hasStdin) {
    prompt = fs.readFileSync(0, 'utf8').trim();
  }

  await runOnce(prompt);
}

main().catch((error) => {
  console.error(error.response?.data ?? error.message ?? error);
  process.exit(1);
});

function tailFileSafe(relativePath, n) {
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to read outside repo root');
  if (!fs.existsSync(abs)) throw new Error(`Not found: ${relativePath}`);
  if (fs.statSync(abs).isDirectory()) throw new Error('Path is a directory');
  const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
  const start = Math.max(1, lines.length - n + 1);
  const slice = lines.slice(-n);
  return slice
    .map((line, idx) => `${start + idx}`.padStart(6, ' ') + ' | ' + line)
    .join('\n');
}

function showFileSliceSafe(relativePath, rangePart = null, contextLines = 0) {
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to read outside repo root');
  if (!fs.existsSync(abs)) throw new Error(`Not found: ${relativePath}`);
  if (fs.statSync(abs).isDirectory()) throw new Error('Path is a directory');
  const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);

  let start = 1;
  let end = lines.length;
  if (rangePart) {
    const [rawStart, rawEnd] = rangePart.split(':').map((p) => p.trim());
    if (rawStart === '' && rawEnd === '') throw new Error('Invalid range');
    start = rawStart ? parseInt(rawStart, 10) : 1;
    end = rawEnd ? parseInt(rawEnd, 10) : lines.length;
    if (Number.isNaN(start) || Number.isNaN(end)) throw new Error('Invalid range numbers');
    if (start < 1) start = 1;
    if (end < start) end = start;
    if (end > lines.length) end = lines.length;
  }

  const ctxStart = Math.max(1, start - contextLines);
  const ctxEnd = Math.min(lines.length, end + contextLines);
  return lines
    .slice(ctxStart - 1, ctxEnd)
    .map((line, idx) => `${ctxStart + idx}`.padStart(6, ' ') + ' | ' + line)
    .join('\n');
}

function readFileSafe(relativePath) {
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to read outside repo root');
  if (!fs.existsSync(abs)) throw new Error(`Not found: ${relativePath}`);
  if (fs.statSync(abs).isDirectory()) throw new Error('Path is a directory');
  return fs.readFileSync(abs, 'utf8');
}

function writeFileSafe(relativePath, content, options = {}) {
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to write outside repo root');
  const dir = path.dirname(abs);
  fs.mkdirSync(dir, { recursive: true });
  if (!options.skipBackup) saveBackup(abs);
  fs.writeFileSync(abs, content, 'utf8');
}

function listDirSafe(relativePath) {
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to list outside repo root');
  if (!fs.existsSync(abs)) throw new Error(`Not found: ${relativePath}`);
  const stats = fs.statSync(abs);
  if (!stats.isDirectory()) throw new Error('Path is not a directory');
  return fs.readdirSync(abs).map((name) => {
    const entryPath = path.join(abs, name);
    const isDir = fs.statSync(entryPath).isDirectory();
    return isDir ? `${name}/` : name;
  });
}

function captureMultiline(rl, onDone) {
  const lines = [];
  const handler = (input) => {
    if (input === '.end') {
      rl.removeListener('line', handler);
      rl.on('line', lineListener);
      onDone(lines.join('\n'));
      return;
    }
    lines.push(input);
  };

  const lineListener = rl.listeners('line')[0];
  rl.removeListener('line', lineListener);
  rl.on('line', handler);
}

async function runCommandSafe(cmd) {
  const { exec } = require('child_process');
  return new Promise((resolve, reject) => {
    const child = exec(cmd, { cwd: repoRoot, timeout: 15000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        const msg = stderr || err.message;
        reject(new Error(msg.trim()));
        return;
      }
      resolve(truncateOutput([stdout, stderr].filter(Boolean).join('\n')));
    });

    child.on('error', (e) => reject(e));
  });
}

function findTextSafe(query, relativePath, limit = 200) {
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to search outside repo root');
  if (!fs.existsSync(abs)) throw new Error(`Not found: ${relativePath}`);

  const hits = [];
  const lcQuery = query.toLowerCase();

  function walk(p) {
    if (hits.length >= limit) return;
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(p)) {
        walk(path.join(p, name));
        if (hits.length >= limit) break;
      }
    } else if (stat.isFile()) {
      const rel = path.relative(repoRoot, p);
      let content;
      try {
        content = fs.readFileSync(p, 'utf8');
      } catch (e) {
        return;
      }
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (hits.length >= limit) return;
        if (line.toLowerCase().includes(lcQuery)) {
          hits.push(`${rel}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }

  walk(abs);
  return hits;
}

function replaceOnceSafe(relativePath, oldText, newText) {
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to write outside repo root');
  if (!fs.existsSync(abs)) throw new Error(`Not found: ${relativePath}`);
  if (oldText === '') throw new Error('Old text cannot be empty');

  const content = fs.readFileSync(abs, 'utf8');
  const occurrences = content.split(oldText).length - 1;
  if (occurrences === 0) throw new Error('Old text not found');
  if (occurrences > 1) throw new Error('Old text matches more than once; be more specific');

  const updated = content.replace(oldText, newText);
  writeFileSafe(relativePath, updated);
}

async function runCommandRestricted(cmd) {
  const whitelist = [
    'ls',
    'pwd',
    'cat',
    'git status',
    'npm test',
    'npm run test',
    'npm run lint',
  ];

  const allowed = whitelist.find((prefix) => cmd === prefix || cmd.startsWith(prefix + ' '));
  if (!allowed) throw new Error('Command not whitelisted for :run!');

  const output = await runCommandSafe(cmd);
  return output;
}

function truncateOutput(text, maxLen = 8000) {
  if (!text) return '';
  if (text.length <= maxLen) return text.trim();
  return `${text.slice(0, maxLen)}\n...[truncated]`;
}

function saveBackup(absPath) {
  const current = fs.existsSync(absPath) ? fs.readFileSync(absPath, 'utf8') : '';
  const stack = backups.get(absPath) || [];
  stack.push(current);
  backups.set(absPath, stack);
}

function undoFileSafe(relativePath) {
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to write outside repo root');
  const stack = backups.get(abs);
  if (!stack || !stack.length) throw new Error('No backup available for this file');
  const previous = stack.pop();
  backups.set(abs, stack);
  fs.writeFileSync(abs, previous, 'utf8');
}

function ripFilesSafe(regexInput, relativePath, limit = 200) {
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to search outside repo root');
  if (!fs.existsSync(abs)) throw new Error(`Not found: ${relativePath}`);
  const rx = buildRegex(regexInput);
  const results = new Set();

  function walk(p) {
    if (results.size >= limit) return;
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      const name = path.basename(p);
      if (['node_modules', '.git', 'dist'].includes(name)) return;
      for (const child of fs.readdirSync(p)) {
        walk(path.join(p, child));
        if (results.size >= limit) break;
      }
    } else if (stat.isFile()) {
      const content = fs.readFileSync(p, 'utf8');
      if (rx.test(content)) {
        results.add(path.relative(repoRoot, p));
      }
      rx.lastIndex = 0;
    }
  }

  walk(abs);
  return Array.from(results).slice(0, limit);
}

function formatHistory(history, systemPrompt, modelName, n = null, forExport = false) {
  const lines = [];
  lines.push(`Model: ${modelName}`);
  if (systemPrompt) lines.push(`System Prompt:\n${systemPrompt}`);
  const messages = n ? history.slice(-n) : history;
  messages.forEach((m, idx) => {
    const header = `${idx + 1}. ${m.role.toUpperCase()}`;
    lines.push(`${header}\n${m.content}`);
  });
  if (forExport) return lines.join('\n\n');
  return lines.join('\n\n');
}

function applyMultiPatchSafe(relativePath, body, options = {}) {
  const { dryrun = false, hunkFilter = null } = options;
  const abs = path.resolve(repoRoot, relativePath);
  if (!abs.startsWith(repoRoot)) throw new Error('Refusing to write outside repo root');
  if (!fs.existsSync(abs)) throw new Error(`Not found: ${relativePath}`);
  if (fs.statSync(abs).isDirectory()) throw new Error('Path is a directory');

  const original = fs.readFileSync(abs, 'utf8');
  const hunkChunks = body.split(/\n===\n/).map((h) => h.trim()).filter(Boolean);
  if (!hunkChunks.length) throw new Error('No hunks provided');

  let content = original;
  const previews = [];
  let appliedCount = 0;

  hunkChunks.forEach((chunk, idx) => {
    const hunkNo = idx + 1;
    if (hunkFilter && !hunkFilter.includes(hunkNo)) return;
    const parts = chunk.split(/\n---\n/);
    if (parts.length !== 2) throw new Error(`Hunk ${hunkNo} missing --- separator`);
    const [oldText, newText] = parts;
    if (!oldText.length) throw new Error(`Hunk ${hunkNo} has empty OLD text`);

    const occurrences = content.split(oldText).length - 1;
    if (occurrences === 0) throw new Error(`Hunk ${hunkNo} OLD text not found`);
    if (occurrences > 1) throw new Error(`Hunk ${hunkNo} matches more than once; aborting`);

    if (dryrun) {
      previews.push(`Hunk ${hunkNo}:\n--- OLD ---\n${oldText}\n--- NEW ---\n${newText}`);
    } else {
      content = content.replace(oldText, newText);
      appliedCount += 1;
    }
  });

  if (hunkFilter && appliedCount === 0 && !dryrun) {
    throw new Error('No selected hunks applied');
  }

  if (dryrun) {
    return { preview: previews.join('\n\n'), applied: 0 };
  }

  writeFileSafe(relativePath, content);
  return { applied: appliedCount, preview: null };
}

function loadEnvFromFile(filename) {
  const envPath = path.join(process.cwd(), filename);
  if (!fs.existsSync(envPath)) return;

  const contents = fs.readFileSync(envPath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (!match) return;

    const [, key, rawValue] = match;
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

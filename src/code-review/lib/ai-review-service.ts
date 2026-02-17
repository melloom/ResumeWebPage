/**
 * AI-powered code review service.
 * Uses gpt-4o-mini (low cost, fast, great for code) to deeply analyze code.
 * Gracefully degrades — if API key missing or call fails, returns null and
 * the app continues with the local regex-based analysis only.
 */

import type { ReviewIssue, ReviewCategory, Severity } from './types';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

// ── Helpers ──────────────────────────────────────────────────────────

function parseJson<T>(text: string): T | null {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) {
      // Try array
      const arrStart = text.indexOf('[');
      const arrEnd = text.lastIndexOf(']');
      if (arrStart !== -1 && arrEnd !== -1) {
        return JSON.parse(text.slice(arrStart, arrEnd + 1)) as T;
      }
      return null;
    }
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

async function callAI(systemPrompt: string, userPrompt: string, maxTokens = 800): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing API key');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

// ── Public API ───────────────────────────────────────────────────────

export function isAIAvailable(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}

// ── 1. AI Code Analysis (deep issue detection on actual code) ────────

const CODE_ANALYSIS_SYSTEM = `You are an expert code reviewer. Analyze the provided code and return a JSON array of issues.
Each issue must be:
{"title": string, "description": string, "severity": "critical"|"warning"|"improvement", "category": "security"|"performance"|"code-quality"|"error-handling"|"architecture"|"scalability", "line": number, "suggestion": string}

Focus on REAL problems:
- Security vulnerabilities (XSS, injection, leaked secrets, insecure patterns)
- Performance bottlenecks (N+1 queries, memory leaks, unnecessary re-renders, large bundles)
- Error handling gaps (uncaught promises, missing try/catch, silent failures)
- Architecture anti-patterns (god objects, tight coupling, circular deps)
- Code quality (dead code, overly complex logic, missing types)

Return ONLY a JSON array. No markdown. Max 8 issues per file. Be specific — reference actual variable/function names from the code.`;

export interface AiCodeIssue {
  title: string;
  description: string;
  severity: Severity;
  category: ReviewCategory;
  line: number;
  suggestion: string;
}

/**
 * Analyze a batch of code files with AI. Chunks files to stay within token limits.
 * Returns AI-detected issues that supplement the local regex analysis.
 */
export async function analyzeCodeWithAI(
  files: Array<{ path: string; content: string }>,
  existingIssueCount: number
): Promise<ReviewIssue[]> {
  if (!isAIAvailable()) return [];

  const allIssues: ReviewIssue[] = [];
  let issueId = existingIssueCount + 1;

  // Chunk files into batches that fit token limits (~3000 chars per file, ~6 files per batch)
  const MAX_CHARS_PER_BATCH = 18000;
  const batches: Array<Array<{ path: string; content: string }>> = [];
  let currentBatch: Array<{ path: string; content: string }> = [];
  let currentSize = 0;

  for (const file of files) {
    // Truncate very large files to first 200 lines
    const lines = file.content.split('\n');
    const truncated = lines.length > 200
      ? lines.slice(0, 200).join('\n') + `\n// ... (${lines.length - 200} more lines truncated)`
      : file.content;

    if (currentSize + truncated.length > MAX_CHARS_PER_BATCH && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [];
      currentSize = 0;
    }
    currentBatch.push({ path: file.path, content: truncated });
    currentSize += truncated.length;
  }
  if (currentBatch.length > 0) batches.push(currentBatch);

  // Limit to max 4 batches to control costs on large projects
  const batchesToProcess = batches.slice(0, 4);

  for (const batch of batchesToProcess) {
    try {
      const codeBlock = batch
        .map((f) => `=== ${f.path} ===\n${f.content}`)
        .join('\n\n');

      const raw = await callAI(CODE_ANALYSIS_SYSTEM, codeBlock, 1200);
      const parsed = parseJson<AiCodeIssue[]>(raw);

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (!item.title || !item.severity) continue;
          // Find which file this issue belongs to
          const matchedFile = batch.find((f) =>
            f.content.split('\n').length >= (item.line || 1)
          );
          allIssues.push({
            id: `ai-issue-${issueId++}`,
            title: `[AI] ${item.title}`,
            description: item.description || item.title,
            severity: (['critical', 'warning', 'improvement'].includes(item.severity)
              ? item.severity
              : 'improvement') as Severity,
            category: item.category || 'code-quality',
            file: matchedFile?.path || batch[0]?.path || 'unknown',
            line: item.line || 1,
            suggestion: item.suggestion || 'Review this code section.',
          });
        }
      }
    } catch (err) {
      console.warn('[AI Review] Batch analysis failed:', err);
      // Continue with remaining batches
    }
  }

  return allIssues;
}

// ── 2. AI Review Summary (natural language insights) ─────────────────

export interface AiReviewInsights {
  summary: string;
  priorityFixes: string[];
  architectureInsights: string[];
  securityNotes: string[];
  positives: string[];
}

const SUMMARY_SYSTEM = `You are an expert senior code reviewer. Given code analysis results (issues, scores, language stats), produce a concise JSON response with:
{
  "summary": "2-3 sentence natural language summary of overall code quality",
  "priorityFixes": ["top 3-5 actionable fixes ranked by impact, each a short sentence"],
  "architectureInsights": ["2-3 observations about the codebase architecture"],
  "securityNotes": ["1-2 security observations if relevant, or empty array"],
  "positives": ["1-2 things the code does well"]
}
Return ONLY valid JSON. No markdown, no prose outside the JSON.`;

export async function generateReviewInsights(reviewData: {
  score: number;
  totalIssues: number;
  critical: number;
  warnings: number;
  improvements: number;
  issues: Array<{ title: string; category: string; severity: string; file: string; suggestion?: string }>;
  languageStats?: Record<string, number>;
  recommendations?: string[];
  linesOfCode?: number;
}): Promise<AiReviewInsights> {
  // Pick the most representative issues — prioritize critical > warning > AI-detected
  const sorted = [...reviewData.issues].sort((a, b) => {
    const sev = { critical: 0, warning: 1, improvement: 2 };
    return (sev[a.severity as keyof typeof sev] ?? 2) - (sev[b.severity as keyof typeof sev] ?? 2);
  });
  const topIssues = sorted.slice(0, 25).map((i) => ({
    title: i.title,
    category: i.category,
    severity: i.severity,
    file: i.file,
    suggestion: i.suggestion,
  }));

  const prompt = `Analyze this code review:
Score: ${reviewData.score}/100
Lines of code: ${reviewData.linesOfCode || 'unknown'}
Issues: ${reviewData.totalIssues} total (${reviewData.critical} critical, ${reviewData.warnings} warnings, ${reviewData.improvements} improvements)
Languages: ${JSON.stringify(reviewData.languageStats || {})}
Top issues: ${JSON.stringify(topIssues)}
Existing recommendations: ${JSON.stringify(reviewData.recommendations?.slice(0, 5) || [])}

Provide your expert analysis as JSON.`;

  const raw = await callAI(SUMMARY_SYSTEM, prompt, 900);
  const parsed = parseJson<AiReviewInsights>(raw);
  if (!parsed) throw new Error('Failed to parse AI response');

  return {
    summary: parsed.summary || 'Analysis complete.',
    priorityFixes: parsed.priorityFixes || [],
    architectureInsights: parsed.architectureInsights || [],
    securityNotes: parsed.securityNotes || [],
    positives: parsed.positives || [],
  };
}

// ── 3. AI-Enhanced Suggestions for individual issues ─────────────────

const SUGGESTION_SYSTEM = `You are a senior developer. Given a code issue, provide a specific, actionable fix.
Include a brief code example if helpful. Keep it under 3 sentences. Return plain text only.`;

export async function getAISuggestion(issue: {
  title: string;
  description: string;
  file: string;
  line: number;
  codeSnippet?: string;
}): Promise<string> {
  const prompt = `Issue: ${issue.title}
Description: ${issue.description}
File: ${issue.file}, Line: ${issue.line}
${issue.codeSnippet ? `Code:\n${issue.codeSnippet}` : ''}

How should this be fixed?`;

  return callAI(SUGGESTION_SYSTEM, prompt, 250);
}

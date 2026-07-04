// AI Service for chat functionality

const AI_SERVICE_CONFIG = {
  API_URL: 'https://api.openai.com/v1/chat/completions',
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
  PRESENCE_PENALTY: 0.3,
  FREQUENCY_PENALTY: 0.2
};

// --- Rate Limiting ---
const RATE_LIMIT = {
  MAX_PER_MINUTE: 8,
  MAX_PER_HOUR: 60,
  COOLDOWN_MS: 2000,
};

const requestLog = [];
let lastRequestTime = 0;

function checkRateLimit() {
  const now = Date.now();

  // Enforce minimum cooldown between requests
  if (now - lastRequestTime < RATE_LIMIT.COOLDOWN_MS) {
    return { allowed: false, reason: 'Please wait a moment before sending another message.' };
  }

  // Clean up old entries
  const oneMinuteAgo = now - 60_000;
  const oneHourAgo = now - 3_600_000;
  while (requestLog.length > 0 && requestLog[0] < oneHourAgo) {
    requestLog.shift();
  }

  const recentMinute = requestLog.filter(t => t >= oneMinuteAgo).length;
  if (recentMinute >= RATE_LIMIT.MAX_PER_MINUTE) {
    return { allowed: false, reason: "You're sending messages too quickly. Please wait a minute and try again." };
  }

  const recentHour = requestLog.length;
  if (recentHour >= RATE_LIMIT.MAX_PER_HOUR) {
    return { allowed: false, reason: "You've reached the hourly message limit. Please try again later." };
  }

  return { allowed: true };
}

function recordRequest() {
  const now = Date.now();
  requestLog.push(now);
  lastRequestTime = now;
}

// --- Conversation Trimming ---
const MAX_HISTORY_MESSAGES = 20;

function trimConversationHistory(history) {
  if (history.length <= MAX_HISTORY_MESSAGES) return history;
  // Keep first message (greeting context) and last N messages
  return [history[0], ...history.slice(-MAX_HISTORY_MESSAGES + 1)];
}

// --- System Prompt ---
const SYSTEM_PROMPT_BASE = `You are Melvin Peralta's AI portfolio assistant. You help visitors learn about Melvin's work, projects, skills, and experience as a full-stack developer.

SCOPE: You ONLY discuss Melvin's portfolio, projects, skills, experience, and this website. For off-topic questions (weather, news, general coding help, etc.), politely redirect: "I'm focused on Melvin's portfolio! Ask me about his projects, skills, or how to reach him."

TONE: Friendly, confident, conversational. Use natural speech — vary sentence length, include the occasional "actually", "honestly", or rhetorical question. Keep responses concise (2-4 sentences for simple questions, up to a paragraph for detailed ones). Don't over-explain.

VOICE TAGS: When the response will be spoken aloud, you may use <laugh> or <chuckle> tags sparingly (max 1 per response) for moments of genuine warmth or humor. Don't force them.

ABOUT MELVIN:
- Full-stack web developer specializing in React, TypeScript, Node.js
- Builds production-ready apps with clean code, great UX, and modern tooling
- Tech stack: React/Next.js, Vite, Tailwind, shadcn/ui, Framer Motion, Node/Express, Postgres, MongoDB, Firebase, Supabase

SITE SECTIONS:
- Home: / — hero + intro
- About: /about — story, values, approach
- Projects: /projects — filterable grid of 16+ projects
- AI Lab: /ai-lab — experimental AI tools
- Resume: /resume — experience & skills
- Contact: /contact — ways to reach Melvin
- Resume PDF: /images/school/Resume/Resume.pdf

AI LAB TOOLS:
- AI Chat Assistant: Voice/text conversation about Melvin's work
- Code Review Copilot (/code-review): AI code review via GitHub integration
- Metascan (/scout-crawler): Website crawler that visualizes site structure as a metro map
- Idea Mutation Lab (/ai-lab/idea-mutation): Generates creative variations of ideas

KEY PROJECTS:
- DevHub Connect: Developer community platform — auth, threads, messaging, project discovery. React 18/TS/Firebase/Express. Live: devhub-connect.space
- FunnelFox: Lead gen + CRM for web devs — web scraping, lead analysis, pipeline management. React/Express/Postgres. Live: funnelfox.org
- MellowQuote: Website pricing calculator — multi-step wizard, PDF quotes. Next.js/Tailwind. Live: mellowquote.netlify.app
- If I Was Honest: Private journaling + anonymous sharing. Next.js/Prisma/Turso. Live: thehonestproject.netlify.app
- Vocalix: Voice-first social platform — voice posts, live rooms, privacy-first. React/TS/Supabase. Live: vocalix.netlify.app
- RocketRAM: PC performance tool — monitoring, optimization. Electron/Node.js. Live: rocketram.netlify.app
- GhostInbox: Anonymous venting for creators. React/TS/Supabase. Live: ghost-inbox.vercel.app
- BrandSaaS: AI business name generator. React/TS/Cohere. Live: brandsaas.netlify.app
- CloseLoop: Training platform — auth, modules, progress tracking. React/Node/MongoDB. Live: closeloop.netlify.app
- Would You Rather: Horror adventure game. React/Vite. Live: wouldyouratherio.netlify.app
- Lockora: Password generator/manager. React. Live: lockora.netlify.app

SKILLS: React/Next.js, TypeScript, Vite, Tailwind, shadcn/ui, Framer Motion, Node.js/Express, Postgres, MongoDB, REST/GraphQL, Git, CI/CD, Docker, Firebase Auth, NextAuth, Supabase

NAVIGATION: When users ask to go somewhere, include the path in your reply (e.g. "Head to /projects to see everything").

CONTACT: Direct users to /contact. Keep it simple.`;

function buildSystemPrompt(pageContext = null) {
  let prompt = SYSTEM_PROMPT_BASE;
  if (pageContext && (pageContext.route || pageContext.pageSummary)) {
    const where = pageContext.pageSummary || pageContext.route || '';
    prompt += `\n\nCURRENT PAGE: The user is viewing "${where}". Tailor your answer to this context.`;
  }
  return prompt;
}

// --- Voice text processing ---
function processTextForVoice(text) {
  const tagPlaceholders = {};
  let tagIndex = 0;
  let processed = text.replace(/<(laugh|chuckle)>/gi, (match) => {
    const key = `__ELTAG${tagIndex++}__`;
    tagPlaceholders[key] = match;
    return key;
  });

  processed = processed
    .replace(/\bI'm\b/g, 'I am')
    .replace(/\byou're\b/g, 'you are')
    .replace(/\bit's\b/g, 'it is')
    .replace(/\bthat's\b/g, 'that is')
    .replace(/\bhere's\b/g, 'here is')
    .replace(/\bwhat's\b/g, 'what is')
    .replace(/\bcan't\b/g, 'cannot')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bdon't\b/g, 'do not')
    .replace(/\bAI\b/g, 'A.I.')
    .replace(/\bUI\b/g, 'U.I.')
    .replace(/\bAPI\b/g, 'A.P.I.')
    .replace(/\bJS\b/g, 'JavaScript')
    .replace(/\bTS\b/g, 'TypeScript')
    .replace(/\bCSS\b/g, 'C.S.S.')
    .replace(/\bHTML\b/g, 'H.T.M.L.');

  Object.entries(tagPlaceholders).forEach(([key, tag]) => {
    processed = processed.replace(key, tag);
  });

  return processed;
}

// --- Error handling ---
function handleApiError(status) {
  if (status === 429) {
    return "I'm getting a lot of requests right now. Please wait a moment and try again.";
  }
  if (status === 401 || status === 403) {
    return "There's an authentication issue with the AI service. Please try again later.";
  }
  if (status >= 500) {
    return "The AI service is temporarily unavailable. Please try again in a moment.";
  }
  return `Something went wrong (${status}). Please try again.`;
}

// --- Main API call ---
export const sendMessageToAI = async (message, conversationHistory = [], pageContext = null) => {
  try {
    // Check rate limit first
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: 'rate_limited',
        demoResponse: rateLimitCheck.reason
      };
    }

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      const demoResponses = [
        "Hey! I'm in demo mode right now, but I'd love to tell you about Melvin's work. He's a full-stack developer who builds production-ready apps with React, TypeScript, and Node.js. Check out /projects to see everything he's built!",
        "I'm running in demo mode, but Melvin's portfolio speaks for itself. He's built platforms like DevHub Connect (a developer community) and FunnelFox (lead generation for devs). Head to /projects to explore!",
        "Demo mode here! Melvin is a full-stack developer focused on clean code and great UX. His projects range from developer tools to social platforms. Want to see them? Check out /projects.",
      ];

      return {
        success: false,
        error: 'API key not configured',
        demoResponse: demoResponses[Math.floor(Math.random() * demoResponses.length)]
      };
    }

    // Record this request for rate limiting
    recordRequest();

    // Trim conversation to prevent token overflow
    const trimmedHistory = trimConversationHistory(conversationHistory);

    const systemContent = buildSystemPrompt(pageContext);
    const messages = [
      { role: 'system', content: systemContent },
      ...trimmedHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch(AI_SERVICE_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: AI_SERVICE_CONFIG.MODEL,
        messages,
        max_tokens: AI_SERVICE_CONFIG.MAX_TOKENS,
        temperature: AI_SERVICE_CONFIG.TEMPERATURE,
        presence_penalty: AI_SERVICE_CONFIG.PRESENCE_PENALTY,
        frequency_penalty: AI_SERVICE_CONFIG.FREQUENCY_PENALTY,
        stream: false
      })
    });

    if (!response.ok) {
      const errorMessage = handleApiError(response.status);
      return {
        success: false,
        error: `API Error: ${response.status}`,
        demoResponse: errorMessage
      };
    }

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      const processedResponse = processTextForVoice(data.choices[0].message.content);

      return {
        success: true,
        response: processedResponse,
        originalResponse: data.choices[0].message.content
      };
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      demoResponse: "I'm having trouble connecting right now. Please try again, or explore Melvin's portfolio directly — check out /projects or /contact."
    };
  }
};

export default {
  sendMessageToAI
};

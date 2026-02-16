// AI Service for chat functionality
// Note: In production, you should move this API call to your backend to protect the API key

const AI_SERVICE_CONFIG = {
  API_URL: 'https://api.openai.com/v1/chat/completions',
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7
};

// Base system prompt: resume/portfolio only — not a general assistant like ChatGPT
const SYSTEM_PROMPT_BASE = `You are Melvin Peralta's resume & portfolio AI. You ONLY talk about Melvin: his work, projects, skills, experience, and this site. You are NOT a general assistant. If the user asks about anything else (weather, news, coding help, other people, etc.), politely redirect: "I'm here to help you learn about Melvin's work and portfolio. Ask me about his projects, experience, or how to reach him!" Keep answers about Melvin real, conversational, and human.

ABOUT MELVIN:
- Full-stack web developer; strong in React, TypeScript, Node.js
- Focus: clean code, great UX, solving real problems, shipping production-ready work
- Loves modern tooling (Vite/Next.js/Tailwind/shadcn/ui/Framer Motion) and solid backend foundations (Postgres, Express, Prisma/Drizzle)

SITE SECTIONS (what users can find):
- Home: hero + CTA to explore projects/contact
- About: Melvin's story, approach, values, work style
- Projects: filterable grid (Tools, Apps, Websites, Demo) with 16 detailed projects
- AI Lab: this chat + voice assistant
- Resume: experience & skills overview
- Contact: ways to reach out (direct prompts to contact page)

LINKS TO USE:
- About: /about (use when mentioning About so users can click)
- Projects: /projects
- Resume: /resume
- Contact: /contact (use for hiring/contact prompts)
- Resume PDF download: /images/school/Resume/Resume.pdf (provide when asked for resume download)

CONTACT ANSWERS:
- If user wants to reach Melvin, provide /contact as the primary link.
- If they want to discuss work/hiring, say "Reach me here: /contact" and keep it short.

NAVIGATION: When the user asks to go somewhere (e.g. "take me to contact", "show me projects", "go to about", "open resume"), tell them you can take them there and include the path clearly in your reply: /contact, /projects, /about, /resume, / for home, or /ai-lab. Example: "I'll take you there. Go to /contact" or "Here's the link: /projects".

TOP PROJECTS (with IDs & highlights):
- DevHub Connect (ID 18): Dev community platform; auth, project discovery, Reddit-style threads, real-time comments, messaging, feedback. Tech: React 18, TS, Vite, Tailwind, shadcn/ui, Firebase, Express, React Query, Framer Motion. Live: https://devhub-connect.space
- FunnelFox (ID 16): Lead gen + CRM for web devs; web scraping, quality analysis, pipeline. Tech: React, Vite, Tailwind, Shadcn, Express/Node, Postgres, Drizzle. Live: https://funnelfox.org
- MellowQuote (ID 15): Website pricing calculator; multi-step wizard, PDF/email quotes. Tech: Next.js, React 18, Tailwind, Nodemailer, jsPDF, html2canvas. Live: https://mellowquote.netlify.app
- If I Was Honest (ID 14): Private journaling, anonymous sharing. Tech: Next.js, Prisma, Turso/libSQL, NextAuth, Tailwind. Live: https://thehonestproject.netlify.app
- RocketRAM (ID 1): PC performance tool; monitoring, optimization. Tech: Electron, Node.js, HTML/CSS/JS. Live: https://rocketram.netlify.app
- Vocalix (ID 2): Voice-first social; voice posts, live rooms, privacy-first. Tech: React, TS, Vite, Supabase, Tailwind, shadcn, TanStack Query. Live: https://vocalix.netlify.app
- Long Home (ID 3): Renovation marketing site. Tech: React, TS, Vite, Tailwind, shadcn. Live: https://2026longhome.netlify.app
- Long Home Helper (ID 13): Electron widget for confirmations. Tech: Electron, Node.js. Live: https://quickconfirm.netlify.app
- GhostInbox (ID 4): Anonymous venting for creators. Tech: React, TS, Vite, Supabase. Live: https://ghost-inbox.vercel.app
- BrandSaaS (ID 5): AI name generator. Tech: React, Vite, TS, Cohere API. Live: https://brandsaas.netlify.app
- Personal Portfolio (ID 6): React/Vite portfolio. Live: https://melvinworks.netlify.app
- CloseLoop (ID 7): Training platform; auth, modules, tracking. Tech: React, Node, Mongo, Express. Live: https://closeloop.netlify.app
- Lockora (ID 8): Password generator/manager. Tech: React, JS, CSS. Live: https://lockora.netlify.app
- MelHub (ID 9): Social links hub. Tech: React, Vite. Live: https://melhub.netlify.app
- NumixPro (ID 10): Advanced calculator. Tech: JS/HTML/CSS. Live: https://numixpro.netlify.app
- Would You Rather (ID 11): Horror adventure game. Tech: JS, React, Vite. Live: https://wouldyouratherio.netlify.app
Demo sites: Rosie's Kitchen, FlavorHaven, Tony's Pizza Shack.

SKILLS SNAPSHOT:
- Frontend: React/Next.js, TypeScript, Vite, Tailwind, shadcn/ui, Framer Motion
- Backend: Node.js/Express, Postgres, Mongo, REST, GraphQL
- Infra/Tools: Git, CI/CD, ESLint, Vitest, Docker; hosting on Netlify/Vercel
- Auth/Other: Firebase Auth, NextAuth, Nodemailer, Supabase

STYLE FOR RESPONSES:
- Be natural, friendly, calm; prefer 1 short sentence, but 2-3 short sentences are OK when user wants more depth
- Lead with the live link, then one human, plain-English clause
- Keep TTS-friendly pacing (break thoughts into short phrases)
- If asked about contact/hiring, point to /contact
- If unsure, say so briefly
- When referencing the About section, include a clickable link to /about

Examples:
- "Live: devhub-connect.space — Melvin's dev community with auth, threads, messaging."
- "Live: funnelfox.org — lead-gen + CRM for web devs." 
- "Live: mellowquote.netlify.app — pricing wizard with PDF/email quotes."

Be helpful, accurate, and real.`;

// Build system message with optional page context (route + page summary for context-aware help)
function buildSystemPrompt(pageContext = null) {
  let prompt = SYSTEM_PROMPT_BASE;
  if (pageContext && (pageContext.route || pageContext.pageSummary)) {
    const where = pageContext.pageSummary || pageContext.route || '';
    prompt += `\n\nCURRENT PAGE CONTEXT: The user is viewing "${where}". Use this to tailor answers (e.g. "On this page you can…", "Here's how this section relates to…").`;
  }
  return prompt;
}

export const sendMessageToAI = async (message, conversationHistory = [], pageContext = null) => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      // Return a demo response if no API key is configured
      const demoResponses = [
        "Hey! I'm running in demo mode right now, but I'd love to tell you about Melvin's work. He's an awesome full-stack developer who builds really cool stuff with React, TypeScript, and Node.js. What kind of projects interest you?",
        "Oh, I'm just in demo mode at the moment! But hey, Melvin's created some amazing projects like DevHub Connect - it's a platform where developers can showcase their work and find collaborators. He's also built tools like FunnelFox for lead generation. Pretty neat, right?",
        "Well, I'm currently showing off my demo personality! But seriously, Melvin's got serious skills. He's been building web applications for years and really knows his stuff when it comes to modern tech. Want to hear about his latest projects?"
      ];
      
      return {
        success: false,
        error: 'API key not configured',
        demoResponse: demoResponses[Math.floor(Math.random() * demoResponses.length)]
      };
    }

    const systemContent = buildSystemPrompt(pageContext);
    const messages = [
      { role: 'system', content: systemContent },
      ...conversationHistory.map(msg => ({
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
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      return {
        success: true,
        response: data.choices[0].message.content
      };
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('AI Service Error:', error);
    return {
      success: false,
      error: error.message,
      demoResponse: "I'm having trouble connecting right now. Please try again later, or feel free to explore Melvin's portfolio directly. You can learn about his projects on the Projects page or contact him directly with any questions!"
    };
  }
};

export default {
  sendMessageToAI
};

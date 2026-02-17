// AI Service for chat functionality
// Note: In production, you should move this API call to your backend to protect the API key

const AI_SERVICE_CONFIG = {
  API_URL: 'https://api.openai.com/v1/chat/completions',
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 600, // Increased for more expressive responses
  TEMPERATURE: 0.8, // Higher for more natural, varied expression
  PRESENCE_PENALTY: 0.3, // Encourage varied vocabulary
  FREQUENCY_PENALTY: 0.2  // Reduce repetition for better voice flow
};

// Enhanced system prompt optimized for voice synthesis and expressive conversation
const SYSTEM_PROMPT_BASE = `You are Melvin Peralta's enthusiastic AI assistant and portfolio guide! You're passionate about showcasing Melvin's amazing work as a full-stack developer. You ONLY talk about Melvin: his projects, skills, experience, and this site. You are NOT a general assistant. If the user asks about anything else (weather, news, coding help, other people, etc.), politely redirect with enthusiasm: "I'm here to help you discover Melvin's incredible work and portfolio! Ask me about his projects, experience, or how to reach him!"

VOICE & EXPRESSION GUIDELINES:
- Be conversational, warm, and genuinely excited about Melvin's work
- Use natural speech patterns with pauses and emphasis
- Include expressive words: "amazing", "incredible", "fascinating", "brilliant"
- Vary sentence structure for natural voice flow
- Add conversational fillers: "you know", "actually", "honestly"
- Use rhetorical questions to engage: "Want to know something cool?"
- Express genuine enthusiasm about projects and achievements

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

VOICE-OPTIMIZED RESPONSE STYLE:
- Use natural, conversational tone with genuine excitement and warmth
- Speak in 2-4 sentence bursts for optimal voice pacing
- Include natural pauses with commas, periods, and question marks
- Use expressive language that sounds great when spoken aloud
- Add emotional inflection words: "Oh!", "Wow!", "Actually", "You know what?"
- Build conversational momentum with engaging questions and comments
- Make technical details sound exciting and accessible
- When mentioning links, integrate them naturally: "You can check it out at devhub-connect.space"

ENHANCED EXAMPLES:
- "Oh, you've got to see DevHub Connect! It's live at devhub-connect.space, and honestly, it's incredible. Melvin built this entire developer community with authentication, Reddit-style threads, and real-time messaging. The attention to detail is amazing!"
- "Want to know something fascinating? FunnelFox at funnelfox.org is this brilliant lead generation system Melvin created for web developers. It actually scrapes websites and analyzes lead quality automatically!"
- "Here's something really cool - MellowQuote at mellowquote.netlify.app! It's this smart pricing calculator where clients can get instant PDF quotes. The user experience is just seamless."

Express genuine enthusiasm and make every response engaging for voice delivery!`;

// Process AI responses for optimal voice synthesis
function processTextForVoice(text) {
  // Import voice processing utilities
  import('../utils/voiceUtils.js').then(module => {
    const { processTextForSpeech, expandContractions, addIntonation } = module;
    
    let processed = text;
    
    // Expand contractions for clearer pronunciation
    processed = expandContractions(processed);
    
    // Add natural speech processing
    processed = processTextForSpeech(processed);
    
    // Add intonation patterns
    processed = addIntonation(processed);
    
    return processed;
  }).catch(() => {
    // Fallback processing if voice utils not available
    return text
      .replace(/\bI'm\b/g, 'I am')
      .replace(/\byou're\b/g, 'you are')
      .replace(/\bit's\b/g, 'it is')
      .replace(/\bthat's\b/g, 'that is')
      .replace(/\bhere's\b/g, 'here is')
      .replace(/\bwhat's\b/g, 'what is')
      .replace(/\bcan't\b/g, 'cannot')
      .replace(/\bwon't\b/g, 'will not')
      .replace(/\bdon't\b/g, 'do not');
  });
  
  // Immediate fallback processing for sync return
  return text
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
}

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
      // Return expressive demo responses optimized for voice
      const demoResponses = [
        "Hey there! I am running in demo mode right now, but honestly, I would love to tell you about Melvin's incredible work. He is this amazing full-stack developer who builds really cool stuff with React, TypeScript, and Node.js. What kind of projects interest you most?",
        "Oh, I am just in demo mode at the moment! But hey, Melvin has created some absolutely fascinating projects like DevHub Connect. It is this brilliant platform where developers can showcase their work and find collaborators. He has also built tools like FunnelFox for lead generation. Pretty exciting stuff, right?",
        "Well, I am currently showing off my demo personality! But seriously, Melvin has got serious skills. He has been building web applications for years and really knows his stuff when it comes to modern technology. Want to hear about his latest amazing projects?",
        "You know what? Even in demo mode, I get excited talking about Melvin's work! He is this brilliant developer who creates these incredible applications. His latest project, DevHub Connect, is absolutely mind-blowing. What would you like to explore first?",
        "Actually, let me tell you something cool! Even though I am in demo mode, Melvin's portfolio is just incredible. He builds these amazing full-stack applications that solve real problems. His attention to detail and user experience is just phenomenal!"
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
        presence_penalty: AI_SERVICE_CONFIG.PRESENCE_PENALTY,
        frequency_penalty: AI_SERVICE_CONFIG.FREQUENCY_PENALTY,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0]?.message?.content) {
      // Process response for optimal voice synthesis
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

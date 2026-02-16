// Lightweight AI-like recommender (deterministic). Treats this as a distinct helper from other AI services.
import { TECHNOLOGIES } from './techData';

const CANDIDATES = {
  ai: ['openai', 'anthropic', 'gemini', 'groq', 'local-llm', 'cloud-ai'],
  db: ['supabase', 'firebase', 'turso', 'postgres', 'mongodb', 'planetscale', 'neon'],
  infra: ['vercel', 'netlify', 'railway', 'flyio', 'docker', 'cloudflare', 'render'],
  auth: ['clerk', 'auth0', 'cognito'],
  payments: ['stripe', 'lemonsqueezy', 'paypal'],
  automation: ['n8n', 'pipedream', 'make'],
  devtools: ['vibecoding', 'lovable', 'cursor', 'windsurf', 'github-copilot'],
  observability: ['sentry', 'datadog', 'newrelic'],
  realtime: ['supabase', 'firebase', 'turso'],
  ecommerce: ['stripe', 'shopify', 'paypal', 'lemonsqueezy'],
  content: ['supabase', 'vercel', 'netlify'],
};

function pickFirstAvailable(ids) {
  return ids.find((id) => TECHNOLOGIES.some((t) => t.id === id));
}

export function recommendStack(prompt) {
  const text = prompt.toLowerCase();
  const picks = new Set();

  const isEcom = /ecom|shop|store|checkout|cart|payment|billing/.test(text);
  const isChat = /chat|llm|assistant|bot/.test(text);
  const isSaas = /saas|subscription|multi-tenant/.test(text);
  const isRealtime = /realtime|real-time|live|sync|presence/.test(text);
  const isAnalytics = /analytics|metrics|events|logging|telemetry/.test(text);
  const isContent = /blog|cms|content|docs/.test(text);

  // Ensure required categories
  const ai = pickFirstAvailable(CANDIDATES.ai);
  const db = pickFirstAvailable(CANDIDATES.db);
  const infra = pickFirstAvailable(CANDIDATES.infra);
  if (ai) picks.add(ai);
  if (db) picks.add(db);
  if (infra) picks.add(infra);

  // Payments
  if (isEcom || isSaas) {
    const pay = pickFirstAvailable(CANDIDATES.payments);
    if (pay) picks.add(pay);
  }

  // Auth
  if (/auth|login|user/.test(text)) {
    const auth = pickFirstAvailable(CANDIDATES.auth);
    if (auth) picks.add(auth);
  }

  // Realtime/automation
  if (isRealtime || /workflow|automation|webhook|jobs|queue/.test(text)) {
    const auto = pickFirstAvailable(CANDIDATES.automation);
    if (auto) picks.add(auto);
  }

  // Observability
  if (isAnalytics || /monitor|logs|metrics|uptime|telemetry/.test(text)) {
    const obs = pickFirstAvailable(CANDIDATES.observability);
    if (obs) picks.add(obs);
  }

  // Dev tools flavor
  if (/ai|code|pair|ide|editor|dev/.test(text)) {
    const devtool = pickFirstAvailable(CANDIDATES.devtools);
    if (devtool) picks.add(devtool);
  }

  // E-commerce specifics
  if (isEcom) {
    const ecommerce = pickFirstAvailable(CANDIDATES.ecommerce);
    if (ecommerce) picks.add(ecommerce);
  }

  // Realtime bias
  if (isRealtime) {
    const rt = pickFirstAvailable(CANDIDATES.realtime);
    if (rt) picks.add(rt);
  }

  // Content sites
  if (isContent) {
    const cont = pickFirstAvailable(CANDIDATES.content);
    if (cont) picks.add(cont);
  }

  // If user mentions specific providers explicitly, try to include them
  TECHNOLOGIES.forEach((t) => {
    if (text.includes(t.name.toLowerCase()) || text.includes(t.id.toLowerCase())) {
      picks.add(t.id);
    }
  });

  return Array.from(picks);
}

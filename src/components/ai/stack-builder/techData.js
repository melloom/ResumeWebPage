export const TECHNOLOGIES = [
  // Frontend
  { id: 'react', name: 'React', icon: '⚛️', color: '200 80% 60%', category: 'Frontend' },
  { id: 'nextjs', name: 'Next.js', icon: '⬛', color: '0 0% 85%', category: 'Frontend' },
  { id: 'sveltekit', name: 'SvelteKit', icon: '🟠', color: '20 90% 60%', category: 'Frontend' },
  { id: 'remix', name: 'Remix', icon: '🎚️', color: '220 70% 60%', category: 'Frontend' },
  { id: 'vue', name: 'Vue', icon: '🟢', color: '130 60% 55%', category: 'Frontend' },
  { id: 'angular', name: 'Angular', icon: '🟥', color: '350 80% 55%', category: 'Frontend' },
  { id: 'astro', name: 'Astro', icon: '🌓', color: '260 60% 60%', category: 'Frontend' },
  { id: 'qwik', name: 'Qwik', icon: '💨', color: '200 70% 60%', category: 'Frontend' },
  { id: 'solid', name: 'Solid', icon: '🔷', color: '220 70% 60%', category: 'Frontend' },
  { id: 'preact', name: 'Preact', icon: '💠', color: '210 70% 60%', category: 'Frontend' },
  { id: 'vanilla', name: 'Vanilla JS + HTML/CSS', icon: '🍦', color: '45 80% 65%', category: 'Frontend' },

  // Backend
  { id: 'express', name: 'Express', icon: '🚂', color: '0 0% 60%', category: 'Backend' },
  { id: 'fastify', name: 'Fastify', icon: '⚡', color: '45 80% 60%', category: 'Backend' },
  { id: 'nestjs', name: 'NestJS', icon: '🛡️', color: '350 80% 60%', category: 'Backend' },
  { id: 'hono', name: 'Hono', icon: '🔥', color: '15 80% 60%', category: 'Backend' },
  { id: 'deno', name: 'Deno', icon: '🦕', color: '190 70% 60%', category: 'Backend' },
  { id: 'bun', name: 'Bun', icon: '🥐', color: '40 80% 60%', category: 'Backend' },
  { id: 'laravel', name: 'Laravel', icon: '🟥', color: '350 80% 55%', category: 'Backend' },
  { id: 'django', name: 'Django', icon: '🐍', color: '150 50% 40%', category: 'Backend' },
  { id: 'spring', name: 'Spring Boot', icon: '🌱', color: '120 70% 55%', category: 'Backend' },
  { id: 'rails', name: 'Ruby on Rails', icon: '💎', color: '350 70% 60%', category: 'Backend' },
  { id: 'fiber', name: 'Go Fiber', icon: '🪶', color: '200 70% 60%', category: 'Backend' },
  { id: 'phoenix', name: 'Phoenix', icon: '🪽', color: '20 80% 60%', category: 'Backend' },

  // AI / LLM
  { id: 'local-llm', name: 'Local LLM', icon: '💻', color: '210 90% 65%', category: 'AI' },
  { id: 'cloud-ai', name: 'Cloud AI', icon: '☁️', color: '250 80% 70%', category: 'AI' },
  { id: 'openai', name: 'OpenAI', icon: '🤖', color: '280 75% 68%', category: 'AI' },
  { id: 'anthropic', name: 'Anthropic', icon: '🧠', color: '295 80% 68%', category: 'AI' },
  { id: 'gemini', name: 'Gemini', icon: '✨', color: '220 80% 70%', category: 'AI' },
  { id: 'ollama', name: 'Ollama', icon: '🦙', color: '200 70% 60%', category: 'AI' },
  { id: 'llama3', name: 'Llama 3', icon: '🦙', color: '210 80% 60%', category: 'AI' },
  { id: 'mistral', name: 'Mistral', icon: '🍃', color: '160 70% 60%', category: 'AI' },
  { id: 'groq', name: 'Groq', icon: '⚡', color: '25 90% 60%', category: 'AI' },
  { id: 'huggingface', name: 'Hugging Face', icon: '🤗', color: '45 90% 60%', category: 'AI' },
  { id: 'perplexity', name: 'Perplexity', icon: '🧭', color: '210 70% 65%', category: 'AI' },
  { id: 'cohere', name: 'Cohere', icon: '🌐', color: '260 70% 60%', category: 'AI' },
  { id: 'ai21', name: 'AI21', icon: '🧾', color: '250 70% 60%', category: 'AI' },
  { id: 'xai', name: 'xAI', icon: '✦', color: '30 80% 60%', category: 'AI' },

  // Data / DB
  { id: 'supabase', name: 'Supabase', icon: '🧪', color: '160 70% 55%', category: 'Data/DB' },
  { id: 'firebase', name: 'Firebase', icon: '🔥', color: '40 95% 60%', category: 'Data/DB' },
  { id: 'turso', name: 'Turso', icon: '🧊', color: '200 80% 60%', category: 'Data/DB' },
  { id: 'postgres', name: 'Postgres', icon: '🐘', color: '210 60% 55%', category: 'Data/DB' },
  { id: 'mysql', name: 'MySQL', icon: '🗄️', color: '205 65% 55%', category: 'Data/DB' },
  { id: 'planetscale', name: 'PlanetScale', icon: '🪐', color: '260 70% 65%', category: 'Data/DB' },
  { id: 'neon', name: 'Neon', icon: '💡', color: '140 80% 60%', category: 'Data/DB' },
  { id: 'redis', name: 'Redis', icon: '🧠', color: '2 80% 60%', category: 'Data/DB' },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃', color: '140 60% 50%', category: 'Data/DB' },
  { id: 'dynamo', name: 'DynamoDB', icon: '🪙', color: '35 80% 55%', category: 'Data/DB' },
  { id: 'clickhouse', name: 'ClickHouse', icon: '🏠', color: '45 90% 55%', category: 'Data/DB' },
  { id: 'cassandra', name: 'Cassandra', icon: '👁️', color: '200 65% 55%', category: 'Data/DB' },

  // Infra / Deploy
  { id: 'docker', name: 'Docker', icon: '🐳', color: '205 75% 60%', category: 'Infra' },
  { id: 'aws', name: 'AWS', icon: '☁️', color: '35 90% 60%', category: 'Infra' },
  { id: 'gcp', name: 'GCP', icon: '🛰️', color: '210 75% 60%', category: 'Infra' },
  { id: 'azure', name: 'Azure', icon: '🌀', color: '200 70% 60%', category: 'Infra' },
  { id: 'cloudflare', name: 'Cloudflare', icon: '⚡', color: '30 90% 60%', category: 'Infra' },
  { id: 'vercel', name: 'Vercel', icon: '▲', color: '220 12% 75%', category: 'Infra' },
  { id: 'netlify', name: 'Netlify', icon: '🌿', color: '175 70% 55%', category: 'Infra' },
  { id: 'railway', name: 'Railway', icon: '🚉', color: '260 70% 68%', category: 'Infra' },
  { id: 'flyio', name: 'Fly.io', icon: '🪁', color: '260 70% 60%', category: 'Infra' },
  { id: 'digitalocean', name: 'DigitalOcean', icon: '🌊', color: '200 75% 55%', category: 'Infra' },
  { id: 'render', name: 'Render', icon: '🖥️', color: '250 75% 65%', category: 'Infra' },
  { id: 'heroku', name: 'Heroku', icon: '💜', color: '280 60% 60%', category: 'Infra' },
  { id: 'ansible', name: 'Ansible', icon: '🅰️', color: '0 0% 60%', category: 'Infra' },

  // Automation / Workflow
  { id: 'n8n', name: 'n8n', icon: '🔁', color: '10 85% 60%', category: 'Automation' },
  { id: 'temporal', name: 'Temporal', icon: '⏱️', color: '330 75% 60%', category: 'Automation' },
  { id: 'airflow', name: 'Airflow', icon: '🌬️', color: '190 80% 55%', category: 'Automation' },
  { id: 'pipedream', name: 'Pipedream', icon: '🧩', color: '280 75% 60%', category: 'Automation' },
  { id: 'make', name: 'Make (Integromat)', icon: '🛠️', color: '250 70% 65%', category: 'Automation' },

  // Feature flags / Config
  { id: 'launchdarkly', name: 'LaunchDarkly', icon: '🚦', color: '200 70% 50%', category: 'Flags' },
  { id: 'configcat', name: 'ConfigCat', icon: '🐱', color: '10 80% 55%', category: 'Flags' },

  // Commerce
  { id: 'stripe', name: 'Stripe', icon: '💳', color: '245 85% 65%', category: 'Commerce' },
  { id: 'lemonsqueezy', name: 'Lemon Squeezy', icon: '🍋', color: '55 85% 60%', category: 'Commerce' },
  { id: 'shopify', name: 'Shopify', icon: '🛍️', color: '140 65% 55%', category: 'Commerce' },
  { id: 'paypal', name: 'PayPal', icon: '💸', color: '205 70% 60%', category: 'Commerce' },

  // Auth
  { id: 'clerk', name: 'Clerk', icon: '🪪', color: '280 75% 65%', category: 'Auth' },
  { id: 'auth0', name: 'Auth0', icon: '🛡️', color: '25 90% 60%', category: 'Auth' },
  { id: 'cognito', name: 'Cognito', icon: '🧬', color: '280 65% 60%', category: 'Auth' },
  { id: 'fusionauth', name: 'FusionAuth', icon: '🧿', color: '20 80% 55%', category: 'Auth' },

  // Messaging / Email
  { id: 'postmark', name: 'Postmark', icon: '✉️', color: '40 85% 60%', category: 'Messaging' },
  { id: 'sendgrid', name: 'SendGrid', icon: '📧', color: '205 75% 60%', category: 'Messaging' },
  { id: 'twilio', name: 'Twilio', icon: '📱', color: '350 80% 60%', category: 'Messaging' },
  { id: 'mailgun', name: 'Mailgun', icon: '📮', color: '355 80% 60%', category: 'Messaging' },
  { id: 'resend', name: 'Resend', icon: '📨', color: '250 60% 60%', category: 'Messaging' },

  // Observability
  { id: 'sentry', name: 'Sentry', icon: '🛰️', color: '340 80% 60%', category: 'Observability' },
  { id: 'logtail', name: 'Logtail', icon: '📜', color: '190 70% 60%', category: 'Observability' },
  { id: 'datadog', name: 'Datadog', icon: '🐶', color: '280 70% 60%', category: 'Observability' },
  { id: 'newrelic', name: 'New Relic', icon: '🧭', color: '170 70% 55%', category: 'Observability' },
  { id: 'opentelemetry', name: 'OpenTelemetry', icon: '🛰️', color: '35 80% 60%', category: 'Observability' },

  // CI/CD
  { id: 'github-actions', name: 'GitHub Actions', icon: '⚙️', color: '210 60% 60%', category: 'CI/CD' },
  { id: 'circleci', name: 'CircleCI', icon: '⭕', color: '160 0% 40%', category: 'CI/CD' },
  { id: 'gitlab-ci', name: 'GitLab CI', icon: '🦊', color: '20 90% 55%', category: 'CI/CD' },
  { id: 'argo', name: 'ArgoCD', icon: '🎯', color: '15 80% 60%', category: 'CI/CD' },

  // Hosting
  { id: 'vercel-host', name: 'Vercel', icon: '▲', color: '220 12% 75%', category: 'Hosting' },
  { id: 'netlify-host', name: 'Netlify', icon: '🌿', color: '175 70% 55%', category: 'Hosting' },
  { id: 'render-host', name: 'Render', icon: '🖥️', color: '250 75% 65%', category: 'Hosting' },
  { id: 'digitalocean-host', name: 'DigitalOcean', icon: '🌊', color: '200 75% 55%', category: 'Hosting' },
  { id: 'heroku-host', name: 'Heroku', icon: '💜', color: '280 60% 60%', category: 'Hosting' },
  { id: 'railway-host', name: 'Railway', icon: '🚉', color: '260 70% 68%', category: 'Hosting' },
  { id: 'flyio-host', name: 'Fly.io', icon: '🪁', color: '260 70% 60%', category: 'Hosting' },

  // Dev tools / IDEs / Platforms
  { id: 'vibecoding', name: 'VibeCoding', icon: '🎛️', color: '280 70% 65%', category: 'Dev Tools' },
  { id: 'web-stacks', name: 'Web Stacks', icon: '🧱', color: '30 80% 60%', category: 'Dev Tools' },
  { id: 'lovable', name: 'Lovable', icon: '💖', color: '330 75% 65%', category: 'Dev Tools' },
  { id: 'cursor', name: 'Cursor', icon: '🖱️', color: '210 70% 65%', category: 'Dev Tools' },
  { id: 'windsurf', name: 'Windsurf', icon: '🌊', color: '200 70% 60%', category: 'Dev Tools' },
  { id: 'zed', name: 'Zed', icon: '⚡', color: '220 70% 65%', category: 'Dev Tools' },
  { id: 'stackblitz', name: 'StackBlitz', icon: '⚙️', color: '200 80% 60%', category: 'Dev Tools' },
  { id: 'codesandbox', name: 'CodeSandbox', icon: '🧩', color: '260 70% 65%', category: 'Dev Tools' },
  { id: 'replit', name: 'Replit', icon: '🌀', color: '260 70% 60%', category: 'Dev Tools' },
  { id: 'warp', name: 'Warp Terminal', icon: '⌨️', color: '170 70% 55%', category: 'Dev Tools' },
  { id: 'raycast', name: 'Raycast', icon: '🧭', color: '345 80% 60%', category: 'Dev Tools' },
  { id: 'github-copilot', name: 'GitHub Copilot', icon: '🧠', color: '210 60% 60%', category: 'Dev Tools' },
  { id: 'tabnine', name: 'TabNine', icon: '🔮', color: '280 60% 60%', category: 'Dev Tools' },
  { id: 'windsurf-ai', name: 'Windsurf AI', icon: '🌬️', color: '200 75% 60%', category: 'Dev Tools' },
];

export const generateMockOutput = (selectedIds) => {
  const selected = TECHNOLOGIES.filter((t) => selectedIds.includes(t.id));
  const names = selected.map((t) => t.name).join(', ');

  const selectedByCategory = (cat) => selected.filter((t) => t.category === cat);

  const hasBackend = selectedByCategory('Backend').length > 0;
  const hasAI = selectedByCategory('AI').length > 0;
  const hasDB = selectedByCategory('Data/DB').length > 0;
  const hasHosting = selectedByCategory('Hosting').length > 0;

  const folderLines = [
    'apps/web (UI)',
    hasBackend && 'apps/api (backend service)',
    'packages/ui (components)',
    hasBackend && 'packages/api (shared clients & contracts)',
    hasAI && 'packages/ai (prompts, vector helpers, SDK)',
    'packages/config (eslint, tsconfig)',
    'packages/libs (shared utils)',
    hasDB && 'infra/db (migrations & seeds)',
    hasHosting && 'infra/deploy (hosting configs & scripts)',
  ].filter(Boolean).join('\n');

  const structureSummary = [
    names ? `Base app with ${names}.` : 'Base app scaffold.',
    'Shared design system, env templates, and CI for lint/test/build.',
    hasAI && 'AI module wired for SDK + prompts.',
    hasDB && 'DB layer with migrations/seeds.',
    hasHosting && 'Hosting configs ready for deploy.',
  ].filter(Boolean).join(' ');

  return {
    structure: structureSummary,
    folders: folderLines,
    workflow: `npm install\nnpm run lint\nnpm test\nnpm run dev:web${hasBackend ? '  (plus npm run dev:api for backend)' : ''}\nDeploy: docker compose up or ship to hosting (Vercel/Netlify/Render)`,
  };
};

export const StackOutputShape = {
  structure: 'string',
  folders: 'string',
  workflow: 'string',
};

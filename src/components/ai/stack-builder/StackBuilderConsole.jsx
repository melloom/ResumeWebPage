import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TechCard from './TechCard';
import OutputCard from './OutputCard';
import { TECHNOLOGIES, generateMockOutput } from './techData';
import { recommendStack } from './aiRecommender';
import styles from './stackBuilder.module.css';

const PROVIDER_LINKS = {
  // Frontend
  react: 'https://react.dev/',
  nextjs: 'https://nextjs.org/',
  sveltekit: 'https://kit.svelte.dev/',
  remix: 'https://remix.run/',
  vue: 'https://vuejs.org/',
  angular: 'https://angular.dev/',
  astro: 'https://astro.build/',
  qwik: 'https://qwik.builder.io/',
  solid: 'https://www.solidjs.com/',
  preact: 'https://preactjs.com/',
  vanilla: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web',

  // Backend
  express: 'https://expressjs.com/',
  fastify: 'https://fastify.dev/',
  nestjs: 'https://nestjs.com/',
  hono: 'https://hono.dev/',
  deno: 'https://deno.com/',
  bun: 'https://bun.sh/',
  laravel: 'https://laravel.com/',
  django: 'https://www.djangoproject.com/',
  spring: 'https://spring.io/projects/spring-boot',
  rails: 'https://rubyonrails.org/',
  fiber: 'https://gofiber.io/',
  phoenix: 'https://www.phoenixframework.org/',

  openai: 'https://platform.openai.com/',
  anthropic: 'https://console.anthropic.com/',
  gemini: 'https://ai.google.dev/',
  groq: 'https://console.groq.com/',
  llama3: 'https://www.llama.com/',
  supabase: 'https://supabase.com/',
  firebase: 'https://firebase.google.com/',
  turso: 'https://turso.tech/',
  postgres: 'https://www.postgresql.org/',
  mysql: 'https://www.mysql.com/',
  planetscale: 'https://planetscale.com/',
  neon: 'https://neon.tech/',
  redis: 'https://redis.io/',
  mongodb: 'https://www.mongodb.com/',
  dynamo: 'https://aws.amazon.com/dynamodb/',
  clickhouse: 'https://clickhouse.com/',
  cassandra: 'https://cassandra.apache.org/',

  // AI / LLMs
  ollama: 'https://ollama.ai/',
  mistral: 'https://mistral.ai/',
  huggingface: 'https://huggingface.co/',
  perplexity: 'https://www.perplexity.ai/',
  cohere: 'https://cohere.com/',
  ai21: 'https://www.ai21.com/',
  xai: 'https://x.ai/',

  // Infra / Automation / CI
  docker: 'https://www.docker.com/',
  aws: 'https://aws.amazon.com/',
  gcp: 'https://cloud.google.com/',
  azure: 'https://azure.microsoft.com/',
  netlify: 'https://www.netlify.com/',
  railway: 'https://railway.app/',
  flyio: 'https://fly.io/',
  n8n: 'https://n8n.io/',
  stripe: 'https://stripe.com/',
  lemonsqueezy: 'https://www.lemonsqueezy.com/',
  auth0: 'https://auth0.com/',
  clerk: 'https://clerk.com/',
  cloudflare: 'https://dash.cloudflare.com/',
  render: 'https://render.com/',
  digitalocean: 'https://www.digitalocean.com/',
  heroku: 'https://www.heroku.com/',
  vercel: 'https://vercel.com/',
  launchdarkly: 'https://launchdarkly.com/',
  configcat: 'https://configcat.com/',
  temporal: 'https://temporal.io/',
  airflow: 'https://airflow.apache.org/',
  pipedream: 'https://pipedream.com/',
  make: 'https://www.make.com/',
  shopify: 'https://www.shopify.com/',
  paypal: 'https://www.paypal.com/',
  cognito: 'https://aws.amazon.com/cognito/',
  fusionauth: 'https://fusionauth.io/',
  postmark: 'https://postmarkapp.com/',
  sendgrid: 'https://sendgrid.com/',
  twilio: 'https://www.twilio.com/',
  mailgun: 'https://www.mailgun.com/',
  resend: 'https://resend.com/',
  sentry: 'https://sentry.io/',
  logtail: 'https://logtail.com/',
  datadog: 'https://www.datadoghq.com/',
  newrelic: 'https://newrelic.com/',
  opentelemetry: 'https://opentelemetry.io/',
  'github-actions': 'https://github.com/features/actions',
  circleci: 'https://circleci.com/',
  'gitlab-ci': 'https://docs.gitlab.com/ee/ci/',
  argo: 'https://argoproj.github.io/',
  'vercel-host': 'https://vercel.com/',
  'netlify-host': 'https://www.netlify.com/',
  'render-host': 'https://render.com/',
  'digitalocean-host': 'https://www.digitalocean.com/',
  'heroku-host': 'https://www.heroku.com/',
  'railway-host': 'https://railway.app/',
  'flyio-host': 'https://fly.io/',
};

const StackBuilderConsole = ({ open, onClose }) => {
  const manualSteps = [
    { label: 'Frontend', required: true },
    { label: 'Backend', required: false },
    { label: 'AI', required: false },
    { label: 'Data/DB', required: false },
    { label: 'Infra', required: false },
    { label: 'Hosting', required: false },
  ];
  const SINGLE_CATEGORY = ['Frontend', 'Backend', 'AI', 'Data/DB', 'Infra', 'Hosting'];
  const REQUIRED_CATEGORIES = manualSteps.filter((s) => s.required).map((s) => s.label);
  const [selected, setSelected] = useState([]);
  const [output, setOutput] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [mode, setMode] = useState(null); // 'ai' | 'manual'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);
  const [manualStep, setManualStep] = useState(0);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(TECHNOLOGIES.map((t) => t.category))).filter(Boolean);
    return ['All', ...unique];
  }, []);

  const filteredTech = useMemo(() => {
    const q = query.toLowerCase().trim();
    return TECHNOLOGIES.filter((t) => {
      const matchesCat = activeCategory === 'All' || t.category === activeCategory;
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [activeCategory, query]);

  const selectionCategories = useMemo(() => {
    const selectedSet = new Set(selected);
    return Array.from(new Set(TECHNOLOGIES.filter(t => selectedSet.has(t.id)).map(t => t.category)));
  }, [selected]);

  const missingCategories = useMemo(
    () => REQUIRED_CATEGORIES.filter((cat) => !selectionCategories.includes(cat)),
    [REQUIRED_CATEGORIES, selectionCategories]
  );

  const canGenerate = selected.length > 0 && missingCategories.length === 0 && !generating;

  const pushToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(''), 3200);
  };

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const chooseMode = (nextMode) => {
    setMode(nextMode);
    setSelected([]);
    setOutput(null);
    setAiError('');
    setAiPrompt('');
    if (nextMode === 'manual') {
      setManualStep(0);
      setActiveCategory(manualSteps[0].label);
    }
  };

  const toggle = useCallback((id) => {
    if (output) return;
    const tech = TECHNOLOGIES.find((t) => t.id === id);
    setSelected((prev) => {
      const next = [...prev];
      const isSelected = next.includes(id);
      if (tech && SINGLE_CATEGORY.includes(tech.category)) {
        for (let i = next.length - 1; i >= 0; i--) {
          const other = TECHNOLOGIES.find((t) => t.id === next[i]);
          if (other && other.category === tech.category && next[i] !== id) {
            next.splice(i, 1);
          }
        }
      }
      if (isSelected) {
        return next.filter((x) => x !== id);
      }
      next.push(id);
      return next;
    });
    setOutput(null);
  }, [SINGLE_CATEGORY]);

  const handleGenerate = useCallback(() => {
    if (selected.length === 0) return;
    setGenerating(true);
    setOutput(null);
    setTimeout(() => {
      setOutput(generateMockOutput(selected));
      setGenerating(false);
    }, 700);
  }, [selected]);

  const handleRestart = useCallback(() => {
    setSelected([]);
    setOutput(null);
    setGenerating(false);
    setMode(null);
    setAiPrompt('');
    setAiError('');
  }, []);

  const handleAiRecommend = useCallback(async () => {
    const prompt = aiPrompt.trim();
    setAiError('');
    if (!prompt) {
      setAiError('Tell the AI what to build.');
      pushToast('Add more detail so AI can suggest a stack.');
      return;
    }
    setAiLoading(true);
    try {
      const rec = recommendStack(prompt);
      if (!rec || rec.length === 0) {
        setAiError('No recommendation found. Try adding more detail.');
      } else {
        setSelected(rec);
        // Auto-generate an output for the recommended stack
        setGenerating(true);
        const output = generateMockOutput(rec);
        setOutput(output);
        setGenerating(false);
      }
    } catch (err) {
      setAiError('AI helper failed. Try again.');
      pushToast('AI needs more info or try again.');
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt]);

  const handleDownloadStack = useCallback(() => {
    if (!output) return;
    const selectedNames = selected
      .map((id) => TECHNOLOGIES.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    const content = [
      'Stack Builder — AI Recommendation',
      '',
      `Selected providers: ${selectedNames || 'N/A'}`,
      '',
      'Recommended structure:',
      output.structure,
      '',
      'Folder layout:',
      output.folders,
      '',
      'Dev workflow:',
      output.workflow,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stack-builder-plan.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [output, selected]);

  const handleDownloadFolders = useCallback(() => {
    if (!output) return;
    const content = ['Stack Builder — Folder layout', '', output.folders].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stack-folders.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [output]);

  const canProceedCurrent = useMemo(() => {
    if (mode !== 'manual') return true;
    const current = manualSteps[manualStep];
    if (!current) return true;
    if (!current.required) return true;
    return selectionCategories.includes(current.label);
  }, [mode, manualStep, selectionCategories]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className={styles.backdrop} onClick={onClose} />

          <motion.div
            className={styles.panelWrap}
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.panel}>
              <button className={styles.closeButton} onClick={onClose} aria-label="Close Stack Builder">
                ✕
              </button>

              <div className={styles.header}>
                <h1>
                  Build your tech stack with <span>Melvin</span>
                </h1>
                <p>Select your technologies and generate a tailored project structure.</p>
              </div>

              {!mode && (
                <div className={styles.modeGrid}>
                  <div className={styles.modeCard} onClick={() => chooseMode('ai')}>
                    <div className={styles.modeBadge}>AI recommended</div>
                    <h3>AI guided</h3>
                    <p>Auto-suggest combos and defaults. Quick start for demos.</p>
                    <span className={styles.modeAction}>Start with AI →</span>
                  </div>
                  <div className={styles.modeCard} onClick={() => chooseMode('manual')}>
                    <div className={styles.modeBadgeMuted}>Manual</div>
                    <h3>Manual picks</h3>
                    <p>Full control. Hand-pick every provider and service.</p>
                    <span className={styles.modeAction}>Choose manually →</span>
                  </div>
                </div>
              )}

              {toast && (
                <div className={styles.toast}>
                  <span>{toast}</span>
                  <button onClick={() => setToast('')}>×</button>
                </div>
              )}

              {mode && (
                <>
                  {mode === 'ai' && (
                    <>
                      <div className={styles.aiPromptRow}>
                        <input
                          type="text"
                          placeholder="Describe what you want to build (e.g., SaaS dashboard with AI chat, Stripe billing, Supabase)"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                        />
                        <button onClick={handleAiRecommend} disabled={aiLoading}>
                          {aiLoading ? 'Thinking…' : 'Ask AI'}
                        </button>
                      </div>
                      {aiError && <div className={styles.aiError}>{aiError}</div>}
                      {selected.length > 0 && (
                        <div className={styles.aiRecoRow}>
                          <div className={styles.recoTitle}>AI suggested stack</div>
                          <div className={styles.recoPills}>
                            {selected.map((id) => {
                              const tech = TECHNOLOGIES.find((t) => t.id === id);
                              if (!tech) return null;
                              return (
                                <span key={id} className={styles.recoPill}>{tech.name}</span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className={styles.backRow}>
                        <button className={styles.backButton} onClick={() => chooseMode(null)}>
                          ← Back to mode selection
                        </button>
                      </div>
                    </>
                  )}

                  {mode === 'manual' && !output && (
                    <>
                      <div className={styles.requirementBox}>
                        Frontend and Backend are required. AI, Data/DB, and Infra are optional—add them if you need intelligence, persistence, or hosting.
                      </div>
                      <div className={styles.stepHeader}>
                        <div className={styles.stepLabel}>Step {manualStep + 1} of {manualSteps.length}</div>
                        <div className={styles.stepTitle}>{manualSteps[manualStep]?.label} providers</div>
                        <div className={styles.stepBadge}>
                          {manualSteps[manualStep]?.required ? 'Required' : 'Optional'}
                        </div>
                        <div className={styles.searchBox}>
                          <input
                            type="text"
                            placeholder={`Search ${manualSteps[manualStep]?.label || ''}...`}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={styles.toggleGrid}>
                        {TECHNOLOGIES.filter((t) => t.category === manualSteps[manualStep]?.label && (!query || t.name.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase()))).map((tech) => (
                          <TechCard
                            key={tech.id}
                            tech={tech}
                            active={selected.includes(tech.id)}
                            onToggle={() => toggle(tech.id)}
                          />
                        ))}
                      </div>

                      <div className={styles.stepNavRow}>
                        <button
                          className={styles.backButton}
                          onClick={() => setManualStep((s) => Math.max(0, s - 1))}
                          disabled={manualStep === 0}
                        >
                          ← Previous
                        </button>
                        {manualStep < manualSteps.length - 1 ? (
                          <button
                            className={styles.downloadButton}
                            onClick={() => setManualStep((s) => s + 1)}
                            disabled={!canProceedCurrent}
                          >
                            Next →
                          </button>
                        ) : (
                          <motion.button
                            onClick={handleGenerate}
                            disabled={!canGenerate || !canProceedCurrent}
                            whileHover={{ scale: !canGenerate ? 1 : 1.03 }}
                            whileTap={{ scale: !canGenerate ? 1 : 0.97 }}
                            className={styles.generateButton}
                          >
                            {generating ? 'Generating…' : 'Generate Stack'}
                          </motion.button>
                        )}
                      </div>
                      <div className={styles.hint}>
                        {missingCategories.length > 0
                          ? `Missing required: ${missingCategories.join(', ')}`
                          : selectionCategories.includes('AI')
                            ? 'Required steps done. AI selected. Add Data/DB or Infra if needed, then Generate.'
                            : 'Required steps done. No AI selected—add one for smarter features, or Generate.'}
                      </div>
                      <div className={styles.backRow}>
                        <button className={styles.backButton} onClick={() => chooseMode(null)}>
                          ← Back to mode selection
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {output && (
                <div className={styles.outputToolbar}>
                  <div>
                    <div className={styles.outputLabel}>Recommended stack</div>
                    <div className={styles.outputSummaryChips}>
                      {selected.map(id => {
                        const tech = TECHNOLOGIES.find(t => t.id === id);
                        const href = PROVIDER_LINKS[id];
                        if (!tech) return null;
                        const content = (
                          <>
                            {tech.icon ? <span className={styles.outputChipIcon}>{tech.icon}</span> : null}
                            <span>{tech.name}</span>
                          </>
                        );
                        return href ? (
                          <a key={id} className={styles.outputChipLink} href={href} target="_blank" rel="noopener noreferrer">
                            {content}
                          </a>
                        ) : (
                          <span key={id} className={styles.outputChip}>{content}</span>
                        );
                      })}
                      {selected.length === 0 && <span className={styles.outputChip}>Not specified</span>}
                    </div>
                  </div>
                  <div className={styles.downloadGroup}>
                    <button className={styles.downloadButton} onClick={handleDownloadStack}>
                      Download plan
                    </button>
                    <button className={styles.downloadButtonSecondary} onClick={handleDownloadFolders}>
                      Folder layout
                    </button>
                    <button className={styles.downloadButtonSecondary} onClick={handleRestart}>
                      Restart
                    </button>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {output && (
                  <motion.div
                    key="output"
                    className={styles.outputGrid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <OutputCard title="Recommended structure" content={output.structure} index={0} accentColor="250 80% 70%" />
                    <OutputCard title="Folder layout" content={output.folders} index={1} accentColor="200 80% 60%" />
                    <OutputCard title="Dev workflow" content={output.workflow} index={2} accentColor="320 70% 65%" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StackBuilderConsole;

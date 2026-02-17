export const LIGHT_THEME = {
  bg: 'hsl(220, 20%, 97%)',
  fg: 'hsl(220, 25%, 10%)',
  card: 'hsl(0, 0%, 100%)',
  cardFg: 'hsl(220, 25%, 10%)',
  primary: 'hsl(142, 60%, 40%)',
  primaryFg: 'hsl(0, 0%, 100%)',
  muted: 'hsl(220, 15%, 94%)',
  mutedFg: 'hsl(220, 10%, 46%)',
  border: 'hsl(220, 15%, 89%)',
  destructive: 'hsl(0, 72%, 51%)',
  warning: 'hsl(38, 92%, 50%)',
  success: 'hsl(142, 60%, 40%)',
  info: 'hsl(210, 100%, 50%)',
  codeBg: 'hsl(220, 15%, 96%)',
  codeFg: 'hsl(220, 25%, 20%)',
};

export const DARK_THEME = {
  bg: 'hsl(225, 25%, 8%)',
  fg: 'hsl(220, 15%, 90%)',
  card: 'hsl(225, 20%, 11%)',
  cardFg: 'hsl(220, 15%, 90%)',
  primary: 'hsl(142, 60%, 50%)',
  primaryFg: 'hsl(225, 25%, 5%)',
  muted: 'hsl(225, 15%, 16%)',
  mutedFg: 'hsl(220, 10%, 55%)',
  border: 'hsl(225, 15%, 18%)',
  destructive: 'hsl(0, 72%, 55%)',
  warning: 'hsl(38, 92%, 55%)',
  success: 'hsl(142, 60%, 50%)',
  info: 'hsl(210, 100%, 60%)',
  codeBg: 'hsl(225, 20%, 13%)',
  codeFg: 'hsl(220, 15%, 85%)',
};

type ThemeVars = typeof LIGHT_THEME;

function themeToCSS(t: ThemeVars, prefix: string): string {
  return `
  ${prefix} {
    --cg-bg: ${t.bg};
    --cg-fg: ${t.fg};
    --cg-card: ${t.card};
    --cg-card-fg: ${t.cardFg};
    --cg-primary: ${t.primary};
    --cg-primary-fg: ${t.primaryFg};
    --cg-muted: ${t.muted};
    --cg-muted-fg: ${t.mutedFg};
    --cg-border: ${t.border};
    --cg-destructive: ${t.destructive};
    --cg-warning: ${t.warning};
    --cg-success: ${t.success};
    --cg-info: ${t.info};
    --cg-code-bg: ${t.codeBg};
    --cg-code-fg: ${t.codeFg};
  }`;
}

export const WIDGET_CSS = `
${themeToCSS(LIGHT_THEME, ':host')}
${themeToCSS(DARK_THEME, ':host(.dark)')}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.cg-root {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 14px;
  color: var(--cg-fg);
  line-height: 1.5;
}

/* FAB */
.cg-fab {
  position: fixed;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--cg-primary);
  color: var(--cg-primary-fg);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.25);
  z-index: 9999;
  transition: transform 0.2s, box-shadow 0.2s;
}
.cg-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
.cg-fab.bottom-right { bottom: 24px; right: 24px; }
.cg-fab.bottom-left { bottom: 24px; left: 24px; }
.cg-fab svg { width: 24px; height: 24px; }

/* Panel */
.cg-panel {
  position: fixed;
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 100px);
  background: var(--cg-card);
  border: 1px solid var(--cg-border);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: cg-slide-up 0.3s ease;
}
.cg-panel.bottom-right { bottom: 92px; right: 24px; }
.cg-panel.bottom-left { bottom: 92px; left: 24px; }

@keyframes cg-slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Panel header */
.cg-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--cg-border);
}
.cg-panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--cg-fg);
}
.cg-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cg-muted-fg);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cg-close-btn:hover { background: var(--cg-muted); }

/* Panel body */
.cg-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Textarea */
.cg-textarea {
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: 1px solid var(--cg-border);
  border-radius: 8px;
  background: var(--cg-code-bg);
  color: var(--cg-code-fg);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}
.cg-textarea:focus { border-color: var(--cg-primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--cg-primary) 25%, transparent); }
.cg-textarea::placeholder { color: var(--cg-muted-fg); }

/* Controls row */
.cg-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Select */
.cg-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--cg-border);
  border-radius: 8px;
  background: var(--cg-card);
  color: var(--cg-fg);
  font-size: 13px;
  outline: none;
  cursor: pointer;
}
.cg-select:focus { border-color: var(--cg-primary); }

/* File upload label */
.cg-file-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--cg-border);
  border-radius: 8px;
  background: var(--cg-card);
  color: var(--cg-fg);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}
.cg-file-label:hover { background: var(--cg-muted); }
.cg-file-input { display: none; }

/* Button */
.cg-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  width: 100%;
}
.cg-btn:active { transform: scale(0.98); }
.cg-btn-primary {
  background: var(--cg-primary);
  color: var(--cg-primary-fg);
}
.cg-btn-primary:hover { filter: brightness(1.1); }
.cg-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: none;
}

/* Results */
.cg-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Score gauge */
.cg-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
}
.cg-score-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--cg-muted-fg);
}

/* Issue list */
.cg-issues {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cg-issue {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--cg-border);
  background: var(--cg-bg);
}
.cg-issue-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}
.cg-badge-critical { background: var(--cg-destructive); color: white; }
.cg-badge-warning { background: var(--cg-warning); color: white; }
.cg-badge-improvement { background: var(--cg-info); color: white; }

.cg-issue-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.cg-issue-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--cg-fg);
}
.cg-issue-desc {
  font-size: 12px;
  color: var(--cg-muted-fg);
}
.cg-issue-file {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--cg-muted-fg);
}

/* Spinner */
.cg-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid var(--cg-primary-fg);
  border-top-color: transparent;
  border-radius: 50%;
  animation: cg-spin 0.6s linear infinite;
}
@keyframes cg-spin { to { transform: rotate(360deg); } }

/* Powered by */
.cg-powered {
  text-align: center;
  padding: 8px;
  font-size: 11px;
  color: var(--cg-muted-fg);
  border-top: 1px solid var(--cg-border);
}
.cg-powered a {
  color: var(--cg-primary);
  text-decoration: none;
}
`;

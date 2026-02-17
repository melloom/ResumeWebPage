import React, { useState, useRef, useCallback } from 'react';
import { CodeGuardianAPI, AnalysisResult } from './widget-api';

interface Props {
  api: CodeGuardianAPI;
}

const LANGUAGES = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

function ScoreGauge({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? 'var(--cg-success)' : score >= 50 ? 'var(--cg-warning)' : 'var(--cg-destructive)';

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--cg-muted)" strokeWidth="8" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize="28"
        fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {score}
      </text>
    </svg>
  );
}

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function CodeGuardianWidget({ api }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const position = api.getConfig().position || 'bottom-right';

  // Sync open/close from external API
  api.setRenderCallback(() => {
    setIsOpen(api.getIsOpen());
  });

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) api.open();
      else api.close();
      return next;
    });
  }, [api]);

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const r = await api.analyze(code, language);
      setResult(r);
    } catch (err) {
      console.error('CodeGuardian analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [api, code, language]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        setCode(content);
        // Auto-detect language from extension
        const ext = file.name.split('.').pop()?.toLowerCase();
        const langMap: Record<string, string> = {
          ts: 'typescript',
          tsx: 'typescript',
          js: 'javascript',
          jsx: 'javascript',
          py: 'python',
          java: 'java',
          cpp: 'cpp',
          go: 'go',
          rs: 'rust',
        };
        if (ext && langMap[ext]) setLanguage(langMap[ext]);
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    []
  );

  if (position === 'inline') {
    return (
      <div className="cg-root">
        {renderPanel()}
      </div>
    );
  }

  return (
    <div className="cg-root">
      {/* FAB */}
      <button className={`cg-fab ${position}`} onClick={handleToggle} aria-label="Code Guardian">
        <ShieldIcon />
      </button>

      {/* Panel */}
      {isOpen && renderPanel()}
    </div>
  );

  function renderPanel() {
    return (
      <div className={`cg-panel ${position}`}>
        <div className="cg-panel-header">
          <h3>Code Guardian</h3>
          {position !== 'inline' && (
            <button className="cg-close-btn" onClick={handleToggle} aria-label="Close">
              <XIcon />
            </button>
          )}
        </div>

        <div className="cg-panel-body">
          {/* Code input */}
          <textarea
            className="cg-textarea"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />

          {/* Controls */}
          <div className="cg-controls">
            <select
              className="cg-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <label className="cg-file-label">
              <UploadIcon /> File
              <input
                ref={fileInputRef}
                type="file"
                className="cg-file-input"
                accept=".ts,.tsx,.js,.jsx,.py,.java,.cpp,.c,.go,.rs"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Analyze button */}
          <button
            className="cg-btn cg-btn-primary"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !code.trim()}
          >
            {isAnalyzing ? (
              <>
                <span className="cg-spinner" /> Analyzing...
              </>
            ) : (
              'Analyze Code'
            )}
          </button>

          {/* Results */}
          {result && (
            <div className="cg-results">
              <div className="cg-score">
                <ScoreGauge score={result.score} />
                <span className="cg-score-label">Code Quality Score</span>
              </div>

              {result.issues.length > 0 && (
                <div className="cg-issues">
                  {result.issues.slice(0, 20).map((issue, i) => (
                    <div key={i} className="cg-issue">
                      <span className={`cg-issue-badge cg-badge-${issue.severity}`}>
                        {issue.severity === 'critical' ? '!' : issue.severity === 'warning' ? '⚠' : '💡'}
                      </span>
                      <div className="cg-issue-body">
                        <div className="cg-issue-title">{issue.title}</div>
                        {issue.suggestion && (
                          <div className="cg-issue-desc">{issue.suggestion}</div>
                        )}
                        <div className="cg-issue-file">
                          {issue.file}:{issue.line}
                        </div>
                      </div>
                    </div>
                  ))}
                  {result.issues.length > 20 && (
                    <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--cg-muted-fg)' }}>
                      +{result.issues.length - 20} more issues
                    </div>
                  )}
                </div>
              )}

              {result.issues.length === 0 && (
                <div style={{ textAlign: 'center', padding: 16, color: 'var(--cg-success)' }}>
                  No issues found - your code looks great!
                </div>
              )}
            </div>
          )}
        </div>

        <div className="cg-powered">
          Powered by <a href="https://codeguardian.dev">Code Guardian</a>
        </div>
      </div>
    );
  }
}

import { useState, useCallback } from 'react';
import { useStore } from '../../store';
import { useScanAnimation } from '../../hooks';
import { isAIAvailable, analyzeScanWithAI, type AiScanInsights } from '../../engine/ai-analysis';

export function ScanSummary() {
  const currentResult = useStore((s) => s.currentResult);
  const animationPhase = useStore((s) => s.animationPhase);
  const { skipAnimation } = useScanAnimation();

  const [aiSummary, setAiSummary] = useState<AiScanInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(true);

  const fetchAISummary = useCallback(async () => {
    if (!currentResult || aiLoading || aiSummary) return;
    setAiLoading(true);
    setAiError(false);
    try {
      const result = await analyzeScanWithAI({
        url: currentResult.url,
        title: currentResult.title,
        lines: currentResult.lines.map((l) => ({
          id: l.id,
          name: l.name,
          stations: l.stations.map((s) => ({
            label: s.label,
            value: s.value,
            confidence: s.confidence,
          })),
        })),
      });
      setAiSummary(result);
    } catch {
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  }, [currentResult, aiLoading, aiSummary]);

  if (!currentResult) return null;

  const totalStations = currentResult.lines.reduce((sum, l) => sum + l.stations.length, 0);
  const totalConnections = currentResult.transfers.length;
  const activeLines = currentResult.lines.filter((l) => l.stations.length > 0).length;

  // Compute average confidence
  const allStations = currentResult.lines.flatMap((l) => l.stations);
  const avgConfidence = allStations.length > 0
    ? Math.round((allStations.reduce((sum, s) => sum + s.confidence, 0) / allStations.length) * 100)
    : 0;

  // Get domain from URL
  let domain = currentResult.url;
  try {
    domain = new URL(currentResult.url).hostname;
  } catch { /* keep original */ }

  return (
    <div className="px-4 py-3">
      <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Scan Results
      </p>

      {/* Title and domain */}
      <div className="mb-3">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-snug truncate">
          {currentResult.title || domain}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{domain}</p>
      </div>

      {/* Skip animation button */}
      {animationPhase !== 'done' && animationPhase !== 'idle' && (
        <button
          onClick={skipAnimation}
          className="w-full mb-3 px-3 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          Skip Animation
        </button>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Data Points" value={totalStations} />
        <StatCard label="Connections" value={totalConnections} />
        <StatCard label="Active Lines" value={activeLines} />
        <StatCard label="Avg Confidence" value={`${avgConfidence}%`} />
      </div>

      {/* AI Scan Summary */}
      {isAIAvailable() && (
        <div className="mt-3">
          {!aiSummary && !aiLoading && !aiError && (
            <button
              onClick={fetchAISummary}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition-colors border border-purple-500/20"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Analyze Site
            </button>
          )}

          {aiLoading && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] text-purple-300">AI analyzing site...</span>
            </div>
          )}

          {aiError && (
            <p className="text-[10px] text-yellow-500/80 mt-1">AI analysis unavailable</p>
          )}

          {aiSummary && (
            <div className="mt-1">
              <button
                onClick={() => setAiExpanded(!aiExpanded)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-medium text-purple-300 hover:bg-purple-500/10 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Summary
                </span>
                <svg
                  className={`w-3 h-3 transition-transform ${aiExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {aiExpanded && (
                <div className="space-y-2 mt-1.5">
                  {/* Business summary */}
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/15">
                    <p className="text-[10px] font-medium text-blue-300 mb-0.5">Business</p>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{aiSummary.businessSummary}</p>
                  </div>

                  {/* Tech */}
                  {aiSummary.techAssessment && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
                      <p className="text-[10px] font-medium text-emerald-300 mb-0.5">Tech</p>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{aiSummary.techAssessment}</p>
                    </div>
                  )}

                  {/* SEO */}
                  {aiSummary.seoInsights.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/15">
                      <p className="text-[10px] font-medium text-amber-300 mb-1">SEO</p>
                      {aiSummary.seoInsights.map((s, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-0.5">
                          <div className="w-1 h-1 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                          <p className="text-[10px] text-[var(--text-secondary)]">{s}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Key findings */}
                  {aiSummary.keyFindings.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/15">
                      <p className="text-[10px] font-medium text-purple-300 mb-1">Findings</p>
                      {aiSummary.keyFindings.map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-0.5">
                          <div className="w-1 h-1 rounded-full bg-purple-400 mt-1 flex-shrink-0" />
                          <p className="text-[10px] text-[var(--text-secondary)]">{f}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="px-2.5 py-2 rounded-lg bg-[var(--bg-tertiary)]">
      <p className="text-base font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
      <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

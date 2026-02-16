import { X, TrendingUp, Users, Wrench, DollarSign, Target, Code2, Lightbulb, BarChart3, AlertTriangle, Clock, DollarSignIcon, TrendingUpIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MutationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mutation: {
    idea: string;
    difficulty: number;
    monetization: number;
    competition: number;
    stack: string[];
    pricing?: string[];
    risks?: string[];
    timeline?: string;
    targetAudience?: string;
    successMetrics?: string[];
  } | null;
}

export function MutationModal({ isOpen, onClose, mutation }: MutationModalProps) {
  if (!mutation) return null;

  const getDifficultyInsight = (score: number) => {
    if (score <= 3) return { label: 'Low', desc: 'Quick to build with standard tools', color: 'emerald' };
    if (score <= 6) return { label: 'Medium', desc: 'Requires solid engineering effort', color: 'blue' };
    if (score <= 8) return { label: 'High', desc: 'Complex architecture needed', color: 'amber' };
    return { label: 'Very High', desc: 'Significant technical challenges', color: 'red' };
  };

  const getMonetizationInsight = (score: number) => {
    if (score <= 3) return { label: 'Limited', desc: 'Difficult to monetize effectively', color: 'red' };
    if (score <= 6) return { label: 'Moderate', desc: 'Standard SaaS pricing possible', color: 'amber' };
    if (score <= 8) return { label: 'Strong', desc: 'High willingness to pay', color: 'blue' };
    return { label: 'Excellent', desc: 'Premium pricing potential', color: 'emerald' };
  };

  const getCompetitionInsight = (score: number) => {
    if (score <= 3) return { label: 'Low', desc: 'Blue ocean opportunity', color: 'emerald' };
    if (score <= 6) return { label: 'Moderate', desc: 'Some existing players', color: 'blue' };
    if (score <= 8) return { label: 'High', desc: 'Crowded market space', color: 'amber' };
    return { label: 'Very High', desc: 'Saturated market', color: 'red' };
  };

  const difficulty = getDifficultyInsight(mutation.difficulty);
  const monetization = getMonetizationInsight(mutation.monetization);
  const competition = getCompetitionInsight(mutation.competition);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-5 flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-blue-400" />
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Detailed Analysis
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold leading-tight">
                    {mutation.idea}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Metrics Overview */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-4 h-4 text-slate-600" />
                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                          Viability Metrics
                        </h3>
                      </div>
                      
                      <div className="space-y-4">
                        <MetricDetail
                          icon={<Wrench className="w-5 h-5" />}
                          label="Build Difficulty"
                          score={mutation.difficulty}
                          insight={difficulty}
                        />
                        <MetricDetail
                          icon={<DollarSign className="w-5 h-5" />}
                          label="Revenue Potential"
                          score={mutation.monetization}
                          insight={monetization}
                        />
                        <MetricDetail
                          icon={<Target className="w-5 h-5" />}
                          label="Market Competition"
                          score={mutation.competition}
                          insight={competition}
                        />
                      </div>
                    </div>

                    {/* Timeline & Audience */}
                    <div className="space-y-4">
                      {mutation.timeline && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <div className="text-sm font-semibold text-blue-900">Build Timeline</div>
                          </div>
                          <div className="text-blue-700 font-medium">{mutation.timeline}</div>
                        </div>
                      )}

                      {mutation.targetAudience && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            <div className="text-sm font-semibold text-purple-900">Target Audience</div>
                          </div>
                          <div className="text-purple-700 font-medium">{mutation.targetAudience}</div>
                        </div>
                      )}
                    </div>

                    {/* Overall Viability */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-5 border border-slate-200">
                      <div className="text-sm font-semibold text-slate-600 mb-2">Overall Viability Score</div>
                      <div className="flex items-end gap-4">
                        <div className="text-4xl font-bold text-slate-900">
                          {calculateViabilityScore(mutation.difficulty, mutation.monetization, mutation.competition)}/10
                        </div>
                        <div className="text-sm text-slate-600 mb-1">
                          {getViabilityLabel(calculateViabilityScore(mutation.difficulty, mutation.monetization, mutation.competition))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Tech Stack */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Code2 className="w-4 h-4 text-slate-600" />
                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                          MVP Tech Stack
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {mutation.stack.map((tech, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium text-slate-700">{tech}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Models */}
                    {mutation.pricing && mutation.pricing.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSignIcon className="w-4 h-4 text-slate-600" />
                          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                            Pricing Strategy
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {mutation.pricing.map((price, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-700">{price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Success Metrics */}
                    {mutation.successMetrics && mutation.successMetrics.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUpIcon className="w-4 h-4 text-slate-600" />
                          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                            Success Metrics
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {mutation.successMetrics.map((metric, i) => (
                            <div key={i} className="flex items-start gap-3 px-3 py-2 bg-emerald-50 rounded-lg text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                              <span className="text-emerald-800 font-medium">{metric}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risks */}
                    {mutation.risks && mutation.risks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="w-4 h-4 text-slate-600" />
                          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                            Key Risks
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {mutation.risks.map((risk, i) => (
                            <div key={i} className="flex items-start gap-3 px-3 py-2 bg-amber-50 rounded-lg text-sm">
                              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span className="text-amber-900">{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function MetricDetail({ 
  icon, 
  label, 
  score, 
  insight 
}: { 
  icon: React.ReactNode; 
  label: string; 
  score: number;
  insight: { label: string; desc: string; color: string };
}) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  const barColorClasses = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-slate-600">
            {icon}
          </div>
          <span className="text-sm font-semibold text-slate-900">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClasses[insight.color as keyof typeof colorClasses]}`}>
            {insight.label}
          </span>
          <span className="text-sm font-bold text-slate-900 w-8 text-right">{score}/10</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${barColorClasses[insight.color as keyof typeof barColorClasses]}`}
        />
      </div>
      <p className="text-xs text-slate-600">{insight.desc}</p>
    </div>
  );
}

function calculateViabilityScore(difficulty: number, monetization: number, competition: number): number {
  const difficultyScore = 10 - difficulty;
  const competitionScore = 10 - competition;
  const avgScore = (difficultyScore + monetization + competitionScore) / 3;
  return Math.round(avgScore * 10) / 10;
}

function getViabilityLabel(score: number): string {
  if (score >= 8) return 'Excellent opportunity';
  if (score >= 6) return 'Strong potential';
  if (score >= 4) return 'Moderate viability';
  return 'Challenging opportunity';
}

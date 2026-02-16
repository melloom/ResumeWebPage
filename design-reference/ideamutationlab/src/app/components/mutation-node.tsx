import { Handle, Position } from '@xyflow/react';
import { TrendingUp, Users, Wrench, Zap, DollarSign, Target, Code2, RefreshCw } from 'lucide-react';

interface MutationNodeData {
  label: string;
  type: 'origin' | 'mutation';
  difficulty?: number;
  monetization?: number;
  competition?: number;
  stack?: string[];
  onClick?: () => void;
  onRegenerate?: () => void;
}

export function MutationNode({ data }: { data: MutationNodeData }) {
  if (data.type === 'origin') {
    return (
      <div className="relative">
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white" />
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-white" />
        <Handle type="source" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-white" />
        <Handle type="source" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white" />
        
        <div className="px-8 py-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg shadow-2xl border border-slate-700 min-w-[300px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Source Idea
            </div>
          </div>
          <div className="text-lg font-semibold leading-tight">{data.label}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      
      {/* Regenerate button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          data.onRegenerate?.();
        }}
        className="absolute -top-3 -right-3 z-10 p-2 bg-slate-900 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800 hover:scale-110 hover:rotate-180 duration-200"
        title="Regenerate this mutation"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
      
      <div 
        onClick={data.onClick}
        className="bg-white rounded-lg shadow-xl border border-slate-200 min-w-[340px] max-w-[360px] hover:border-blue-500 hover:shadow-2xl transition-all duration-200 cursor-pointer overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="text-sm font-semibold text-slate-900 leading-snug">
            {data.label}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <MetricCard
              icon={<Wrench className="w-3.5 h-3.5" />}
              label="Difficulty"
              value={data.difficulty || 0}
            />
            <MetricCard
              icon={<DollarSign className="w-3.5 h-3.5" />}
              label="Revenue"
              value={data.monetization || 0}
            />
            <MetricCard
              icon={<Target className="w-3.5 h-3.5" />}
              label="Competition"
              value={data.competition || 0}
            />
          </div>

          {/* Stack Preview */}
          {data.stack && data.stack.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Tech Stack
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.stack.slice(0, 3).map((tech, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
                {data.stack.length > 3 && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded text-xs font-medium">
                    +{data.stack.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Click indicator */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
          <div className="text-xs text-slate-400 text-center">
            Click for full analysis
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
}) {
  const getColor = () => {
    if (label === 'Revenue') {
      return value > 7 ? 'text-emerald-600 bg-emerald-50' : value > 4 ? 'text-blue-600 bg-blue-50' : 'text-slate-600 bg-slate-50';
    }
    if (label === 'Difficulty' || label === 'Competition') {
      return value > 7 ? 'text-red-600 bg-red-50' : value > 4 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';
    }
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div className={`${getColor()} rounded-lg p-2.5 text-center`}>
      <div className="flex items-center justify-center mb-1">
        {icon}
      </div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wide opacity-75">{label}</div>
    </div>
  );
}

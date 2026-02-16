import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MutationNode } from './components/mutation-node';
import { generateMutations, regenerateSingleMutation } from './components/mutation-engine';
import { MutationModal } from './components/mutation-modal';
import { Sparkles, RotateCcw, Network, Download, History, Filter, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const nodeTypes = {
  mutationNode: MutationNode,
};

interface HistoryItem {
  id: string;
  idea: string;
  timestamp: Date;
  mutations: any[];
}

export default function App() {
  const [idea, setIdea] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMutation, setSelectedMutation] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMutations, setCurrentMutations] = useState<any[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<number | null>(null);
  const [filterRevenue, setFilterRevenue] = useState<number | null>(null);
  const [filterCompetition, setFilterCompetition] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mutation-history');
    if (saved) {
      const parsed = JSON.parse(saved);
      setHistory(parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })));
    }
  }, []);

  const handleMutate = useCallback(() => {
    if (!idea.trim() || isGenerating) return;

    setIsGenerating(true);
    
    setTimeout(() => {
      const mutations = generateMutations(idea);
      setCurrentMutations(mutations);
      
      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        idea,
        timestamp: new Date(),
        mutations
      };
      const newHistory = [newHistoryItem, ...history].slice(0, 10); // Keep last 10
      setHistory(newHistory);
      localStorage.setItem('mutation-history', JSON.stringify(newHistory));
      
      createNodesAndEdges(idea, mutations);
      setIsGenerating(false);
    }, 400);
  }, [idea, isGenerating, history]);

  const createNodesAndEdges = (sourceIdea: string, mutations: any[]) => {
    const originNode: Node = {
      id: 'origin',
      type: 'mutationNode',
      position: { x: 500, y: 400 },
      data: { 
        label: sourceIdea,
        type: 'origin',
      },
    };

    const mutationNodes: Node[] = mutations.map((mutation, index) => {
      const angle = (index / mutations.length) * 2 * Math.PI - Math.PI / 2;
      const radius = 480;
      const x = 500 + Math.cos(angle) * radius;
      const y = 400 + Math.sin(angle) * radius;

      return {
        id: `mutation-${index}`,
        type: 'mutationNode',
        position: { x, y },
        data: {
          label: mutation.idea,
          type: 'mutation',
          difficulty: mutation.difficulty,
          monetization: mutation.monetization,
          competition: mutation.competition,
          stack: mutation.stack,
          onClick: () => {
            setSelectedMutation(mutation);
            setIsModalOpen(true);
          },
          onRegenerate: () => handleRegenerateMutation(index),
        },
      };
    });

    const mutationEdges: Edge[] = mutations.map((_, index) => ({
      id: `edge-${index}`,
      source: 'origin',
      target: `mutation-${index}`,
      animated: true,
      style: { 
        stroke: '#3b82f6',
        strokeWidth: 2,
      },
    }));

    setNodes([originNode, ...mutationNodes]);
    setEdges(mutationEdges);
    setHasGenerated(true);
  };

  const handleRegenerateMutation = (index: number) => {
    const excludeIdeas = currentMutations.map(m => m.idea);
    const newMutation = regenerateSingleMutation(idea, excludeIdeas);
    
    const updatedMutations = [...currentMutations];
    updatedMutations[index] = newMutation;
    setCurrentMutations(updatedMutations);
    
    createNodesAndEdges(idea, updatedMutations);
  };

  const handleReset = () => {
    setIdea('');
    setNodes([]);
    setEdges([]);
    setHasGenerated(false);
    setCurrentMutations([]);
    setFilterDifficulty(null);
    setFilterRevenue(null);
    setFilterCompetition(null);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setIdea(item.idea);
    setCurrentMutations(item.mutations);
    createNodesAndEdges(item.idea, item.mutations);
    setShowHistory(false);
  };

  const exportData = () => {
    const data = {
      idea,
      mutations: currentMutations,
      generatedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mutations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const text = currentMutations.map((m, i) => 
      `${i + 1}. ${m.idea}\n   Difficulty: ${m.difficulty}/10 | Revenue: ${m.monetization}/10 | Competition: ${m.competition}/10\n   Stack: ${m.stack.join(', ')}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(`Mutations for: "${idea}"\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Apply filters
  const filteredNodes = nodes.filter(node => {
    if (node.data.type === 'origin') return true;
    
    const data = node.data;
    if (filterDifficulty && data.difficulty > filterDifficulty) return false;
    if (filterRevenue && data.monetization < filterRevenue) return false;
    if (filterCompetition && data.competition > filterCompetition) return false;
    
    return true;
  });

  const filteredEdges = edges.filter(edge => 
    filteredNodes.some(node => node.id === edge.target)
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500 rounded-lg">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Idea Mutation Lab
                </h1>
                <p className="text-sm text-slate-500">
                  Generate and analyze startup variations
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasGenerated && (
                <>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={exportData}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </>
              )}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors relative"
              >
                <History className="w-4 h-4" />
                History
                {history.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {history.length}
                  </span>
                )}
              </button>
              {hasGenerated && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && hasGenerated && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-100 border-b border-slate-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center gap-6">
                <div className="text-sm font-semibold text-slate-700">Filter Mutations:</div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Max Difficulty:</label>
                  <select 
                    value={filterDifficulty || ''} 
                    onChange={(e) => setFilterDifficulty(e.target.value ? Number(e.target.value) : null)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="">Any</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Min Revenue:</label>
                  <select 
                    value={filterRevenue || ''} 
                    onChange={(e) => setFilterRevenue(e.target.value ? Number(e.target.value) : null)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="">Any</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}+</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Max Competition:</label>
                  <select 
                    value={filterCompetition || ''} 
                    onChange={(e) => setFilterCompetition(e.target.value ? Number(e.target.value) : null)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="">Any</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => {
                    setFilterDifficulty(null);
                    setFilterRevenue(null);
                    setFilterCompetition(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-2xl z-40 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Generation History</h2>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
              
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      <div className="font-medium text-slate-900 text-sm mb-1">{item.idea}</div>
                      <div className="text-xs text-slate-500">
                        {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        {item.mutations.length} mutations
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Section */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMutate()}
              placeholder='Enter your startup idea (e.g., "SaaS for restaurant management")'
              className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-900 placeholder:text-slate-400"
            />
            <button
              onClick={handleMutate}
              disabled={!idea.trim() || isGenerating}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Mutations'}
            </button>
          </div>
        </div>
      </div>

      {/* Graph View */}
      <div className="flex-1 relative">
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-xl px-6">
              <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Network className="w-10 h-10 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Ready to Generate Mutations
              </h2>
              <p className="text-slate-600 mb-8 text-lg">
                Enter your startup idea and we'll generate 5 specialized variations with detailed analysis.
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-3xl mb-2">🧬</div>
                  <div className="text-sm font-semibold text-slate-900">5 Variations</div>
                  <div className="text-xs text-slate-500 mt-1">Per concept</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-sm font-semibold text-slate-900">Smart Analysis</div>
                  <div className="text-xs text-slate-500 mt-1">Auto-scored</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-sm font-semibold text-slate-900">Export & Save</div>
                  <div className="text-xs text-slate-500 mt-1">Track ideas</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={1.2}
            proOptions={{ hideAttribution: true }}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={16} 
              size={1} 
              color="#cbd5e1"
            />
            <Controls 
              className="bg-white border border-slate-200 rounded-lg shadow-lg"
            />
          </ReactFlow>
        )}
      </div>

      {/* Modal */}
      <MutationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mutation={selectedMutation}
      />
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useEdgesState,
  useNodesState,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Sparkles,
  RotateCcw,
  Network,
  Download,
  History,
  Filter,
  Copy,
  Check,
  X,
} from 'lucide-react';
import styles from './IdeaMutationLab.module.css';
import { generateMutations, regenerateSingleMutation } from './mutationEngine';
import MutationNode from './MutationNode';
import MutationModal from './MutationModal';

const nodeTypes = {
  mutationNode: MutationNode,
};

const STORAGE_KEY = 'mutation-history';

const IdeaMutationLab = ({ open, onClose }) => {
  const [idea, setIdea] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMutation, setSelectedMutation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMutations, setCurrentMutations] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState(null);
  const [filterRevenue, setFilterRevenue] = useState(null);
  const [filterCompetition, setFilterCompetition] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load history on mount
  useEffect(() => {
    if (!open) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(
          parsed.map((item) => ({
            ...item,
            timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
          }))
        );
      }
    } catch (e) {
      console.error('Failed to load mutation history', e);
    }
  }, [open]);

  const persistHistory = (items) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items.map((item) => ({ ...item, timestamp: item.timestamp.toISOString() })))
      );
    } catch (e) {
      console.error('Failed to save mutation history', e);
    }
  };

  const positionForAngle = (angle) => {
    const deg = (angle * 180) / Math.PI;
    if (deg >= -45 && deg < 45) return Position.Left; // node is to the right of origin, connect on its left
    if (deg >= 45 && deg < 135) return Position.Top;
    if (deg >= -135 && deg < -45) return Position.Bottom;
    return Position.Right; // node is to the left of origin
  };

  const createNodesAndEdges = useCallback((sourceIdea, mutations) => {
    const originNode = {
      id: 'origin',
      type: 'mutationNode',
      position: { x: 500, y: 400 },
      data: {
        label: sourceIdea,
        type: 'origin',
      },
    };

    const mutationNodes = mutations.map((mutation, index) => {
      const angle = (index / mutations.length) * 2 * Math.PI - Math.PI / 2;
      const radius = 420;
      const x = 500 + Math.cos(angle) * radius;
      const y = 400 + Math.sin(angle) * radius;
      const targetPosition = positionForAngle(angle);

      return {
        id: `mutation-${index}`,
        type: 'mutationNode',
        position: { x, y },
        targetPosition,
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

    const mutationEdges = mutations.map((_, index) => ({
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
  }, []);

  const runGeneration = useCallback((sourceIdea) => {
    const cleanIdea = (sourceIdea || '').trim();
    if (!cleanIdea || isGenerating) return;
    setIsGenerating(true);

    setTimeout(() => {
      const mutations = generateMutations(cleanIdea);
      setCurrentMutations(mutations);
      setIdea(cleanIdea);

      const newHistoryItem = {
        id: Date.now().toString(),
        idea: cleanIdea,
        timestamp: new Date(),
        mutations,
      };
      const newHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(newHistory);
      persistHistory(newHistory);

      createNodesAndEdges(cleanIdea, mutations);
      setIsGenerating(false);
    }, 350);
  }, [createNodesAndEdges, history, isGenerating, persistHistory]);

  const handleMutate = useCallback(() => {
    runGeneration(idea);
  }, [runGeneration, idea]);

  const handleRegenerateMutation = (index) => {
    const excludeIdeas = currentMutations.map((m) => m.idea);
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
    setShowFilters(false);
  };

  const loadFromHistory = (item) => {
    setIdea(item.idea);
    setCurrentMutations(item.mutations);
    createNodesAndEdges(item.idea, item.mutations);
    setShowHistory(false);
  };

  const exportData = () => {
    const data = {
      idea,
      mutations: currentMutations,
      generatedAt: new Date().toISOString(),
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
    const text = currentMutations
      .map(
        (m, i) =>
          `${i + 1}. ${m.idea}\n   Difficulty: ${m.difficulty}/10 | Revenue: ${m.monetization}/10 | Competition: ${m.competition}/10\n   Stack: ${m.stack?.join(', ')}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(`Mutations for: "${idea}"\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (node.data.type === 'origin') return true;
      const data = node.data;
      if (filterDifficulty && data.difficulty > filterDifficulty) return false;
      if (filterRevenue && data.monetization < filterRevenue) return false;
      if (filterCompetition && data.competition > filterCompetition) return false;
      return true;
    });
  }, [nodes, filterCompetition, filterDifficulty, filterRevenue]);

  const filteredEdges = useMemo(
    () => edges.filter((edge) => filteredNodes.some((node) => node.id === edge.target)),
    [edges, filteredNodes]
  );

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.branding}>
            <div className={styles.logoMark}>
              <Network size={20} />
            </div>
            <div>
              <div className={styles.title}>Idea Mutation Lab</div>
              <div className={styles.subtitle}>Generate and map idea variations visually</div>
            </div>
          </div>

          <div className={styles.actions}>
            {hasGenerated && (
              <>
                <button onClick={() => setShowFilters((v) => !v)} className={styles.secondaryBtn}>
                  <Filter size={15} /> Filters
                </button>
                <button onClick={copyToClipboard} className={styles.secondaryBtn}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={exportData} className={styles.secondaryBtn}>
                  <Download size={15} /> Export
                </button>
              </>
            )}
            <button onClick={() => setShowHistory((v) => !v)} className={styles.secondaryBtn}>
              <History size={15} /> History
              {history.length > 0 && <span className={styles.countBadge}>{history.length}</span>}
            </button>
            <button onClick={onClose} className={styles.iconBtn} aria-label="Close idea mutation lab">
              <X size={16} />
            </button>
          </div>
        </header>

        <div className={styles.inputBar}>
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleMutate()}
            placeholder="Enter your startup idea (e.g., SaaS for restaurant management)"
          />
          <button onClick={handleMutate} disabled={!idea.trim() || isGenerating} className={styles.primaryBtn}>
            <Sparkles size={16} />
            {isGenerating ? 'Generating…' : 'Generate Mutations'}
          </button>
          {hasGenerated && (
            <button onClick={handleReset} className={styles.secondaryGhost}>
              <RotateCcw size={16} /> Reset
            </button>
          )}
        </div>

        {showFilters && hasGenerated && (
          <div className={styles.filters}>
            <div className={styles.filterLabel}>Filter mutations</div>
            <div className={styles.filterRow}>
              <label>Max Difficulty</label>
              <select
                value={filterDifficulty || ''}
                onChange={(e) => setFilterDifficulty(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <label>Min Revenue</label>
              <select
                value={filterRevenue || ''}
                onChange={(e) => setFilterRevenue(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>

              <label>Max Competition</label>
              <select
                value={filterCompetition || ''}
                onChange={(e) => setFilterCompetition(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setFilterDifficulty(null);
                  setFilterRevenue(null);
                  setFilterCompetition(null);
                }}
                className={styles.clearFilters}
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        <div className={styles.canvasWrap}>
          {nodes.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🧬</div>
              <h3>Ready to generate mutations</h3>
              <p>Enter an idea to visualize 5 tailored variations with scores and tech stacks.</p>
              <div className={styles.emptyGrid}>
                <div className={styles.emptyCard}>
                  <div className={styles.emptyLabel}>5 Variations</div>
                  <div className={styles.emptyHint}>Per concept</div>
                </div>
                <div className={styles.emptyCard}>
                  <div className={styles.emptyLabel}>Smart Analysis</div>
                  <div className={styles.emptyHint}>Auto-scored</div>
                </div>
                <div className={styles.emptyCard}>
                  <div className={styles.emptyLabel}>Export & Save</div>
                  <div className={styles.emptyHint}>Track ideas</div>
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
              minZoom={0.25}
              maxZoom={1.4}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
              <Controls className={styles.controls} />
            </ReactFlow>
          )}
        </div>

        {showHistory && (
          <aside className={styles.historyPanel}>
            <div className={styles.historyHeader}>
              <div>
                <div className={styles.historyTitle}>Generation history</div>
                <div className={styles.historyHint}>Last 10 runs saved locally</div>
              </div>
              <button className={styles.iconBtn} onClick={() => setShowHistory(false)} aria-label="Close history">
                <X size={16} />
              </button>
            </div>
            {history.length === 0 ? (
              <div className={styles.historyEmpty}>No history yet</div>
            ) : (
              <div className={styles.historyList}>
                {history.map((item) => (
                  <button key={item.id} className={styles.historyItem} onClick={() => loadFromHistory(item)}>
                    <div className={styles.historyIdea}>{item.idea}</div>
                    <div className={styles.historyMeta}>
                      {item.timestamp?.toLocaleDateString()} • {item.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={styles.historyCount}>{item.mutations.length} mutations</div>
                  </button>
                ))}
              </div>
            )}
          </aside>
        )}

        <MutationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mutation={selectedMutation}
          sourceIdea={idea}
          onMutateThis={() => {
            if (selectedMutation) runGeneration(selectedMutation.idea);
          }}
          onPinToOrigin={() => {
            if (selectedMutation) runGeneration(selectedMutation.idea);
          }}
        />
      </div>
    </div>
  );
};

export default IdeaMutationLab;

import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  Folder,
  File,
  X,
  Bot,
  Sparkles,
  Shield,
  ThumbsUp,
  Lightbulb,
  Layers,
} from "lucide-react";
import { Button } from "@code-review/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@code-review/components/ui/card";
import { Badge } from "@code-review/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@code-review/components/ui/tabs";
import {
  Dialog,
  DialogContentSolid,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@code-review/components/ui/dialog";
import {
  categoryLabels,
  categoryIcons,
  type ReviewCategory,
  type Severity,
  type ReviewIssue,
  type Review,
} from "@code-review/lib/types";
import {
  isAIAvailable,
  generateReviewInsights,
  getAISuggestion,
  type AiReviewInsights,
} from "@code-review/lib/ai-review-service";

const severityConfig: Record<
  Severity,
  { label: string; color: string; icon: typeof AlertTriangle }
> = {
  critical: { label: "Critical", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
  warning: { label: "Warning", color: "bg-warning text-warning-foreground", icon: Info },
  improvement: { label: "Improvement", color: "bg-info text-info-foreground", icon: CheckCircle2 },
};

function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = severityConfig[severity];
  return (
    <Badge className={`${cfg.color} gap-1 text-xs`}>
      <cfg.icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

function IssueCard({ issue, reviewId }: { issue: ReviewIssue; reviewId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState<string[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiSuggestionLoading, setAiSuggestionLoading] = useState(false);

  const fetchAISuggestion = async () => {
    if (aiSuggestion || aiSuggestionLoading || !isAIAvailable()) return;
    setAiSuggestionLoading(true);
    try {
      const result = await getAISuggestion({
        title: issue.title,
        description: issue.description,
        file: issue.file,
        line: issue.line,
        codeSnippet: codeSnippet.join('\n'),
      });
      setAiSuggestion(result);
    } catch {
      setAiSuggestion('AI suggestion unavailable.');
    } finally {
      setAiSuggestionLoading(false);
    }
  };

  // Fetch code snippet when modal opens
  const fetchActualCode = async () => {
    if (codeSnippet.length) return; // Already loaded
    
    try {
      // Try to get the code from the analysis data
      const reviewData = JSON.parse(localStorage.getItem('reviews') || '[]');
      const currentReview = reviewData.find((r: Review) => r.id === reviewId);
      
      if (currentReview && currentReview.rawFiles) {
        const fileContent = currentReview.rawFiles[issue.file];
        if (fileContent) {
          const lines = fileContent.split('\n');
          const startLine = Math.max(0, issue.line - 3);
          const endLine = Math.min(lines.length - 1, issue.line + 2);
          
          const snippet = lines.slice(startLine, endLine + 1).map((line, index) => {
            const actualLineNumber = startLine + index + 1;
            const isIssueLine = actualLineNumber === issue.line;
            return `${String(actualLineNumber).padStart(2, ' ')}${isIssueLine ? ' >' : '  '} ${line}`;
          });
          
          setCodeSnippet(snippet);
          return;
        }
      }
      
      // Fallback if no raw file data available
      setCodeSnippet([
        `// Line ${issue.line - 2}: Code before issue`,
        `// No file content available`,
        `// Line ${issue.line}: ${issue.title} <-- ISSUE HERE`,
        `// Line ${issue.line + 1}: Code after issue`,
        `// Please check the actual file for details`,
        ''
      ]);
    } catch (error) {
      console.error('Failed to fetch actual code:', error);
      // Fallback to generic snippet
      setCodeSnippet([
        `// Line ${issue.line - 2}: Code before issue`,
        `// Unable to fetch file content`,
        `// Line ${issue.line}: ${issue.title} <-- ISSUE HERE`,
        `// Line ${issue.line + 1}: Code after issue`,
        `// Please check the actual file`,
        ''
      ]);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border/50 p-4 space-y-3 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => {
          fetchActualCode();
          setIsOpen(true);
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={issue.severity} />
              <h4 className="font-semibold text-sm">{issue.title}</h4>
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              {issue.file}:{issue.line}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContentSolid className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <SeverityBadge severity={issue.severity} />
              <DialogTitle className="text-lg">{issue.title}</DialogTitle>
            </div>
            <DialogDescription className="font-mono text-xs">
              {issue.file}:{issue.line}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h5 className="font-medium text-sm mb-2">Issue Description</h5>
              <p className="text-sm text-muted-foreground">{issue.description}</p>
            </div>
            
            <div>
              <h5 className="font-medium text-sm mb-2">Location in Code</h5>
              <div className="rounded-md bg-code-bg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <File className="h-3 w-3 text-primary" />
                  <span className="text-xs font-mono text-primary">{issue.file}</span>
                  <span className="text-xs text-muted-foreground">Line {issue.line}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  This issue was detected at line {issue.line} in the file above.
                </div>
                <div className="rounded border border-border/30 bg-background p-3">
                  <div className="text-xs text-muted-foreground mb-2">
                    Code around line {issue.line}:
                  </div>
                  <div className="max-w-full overflow-hidden">
                    <pre className="text-xs font-mono text-code-foreground overflow-x-auto overflow-y-hidden max-h-64 whitespace-pre-wrap break-words bg-slate-50 dark:bg-slate-900 p-3 rounded border">
                      <code className="block">
                        {codeSnippet.map((line, index) => {
                          const lineNum = issue.line - 2 + index;
                          const isIssueLine = lineNum === issue.line;
                          return `${String(lineNum).padStart(2, ' ')}${isIssueLine ? ' >' : '  '} ${line}`;
                        }).join('\n')}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-sm mb-2">💡 Suggested Fix</h5>
              <div className="rounded-md bg-code-bg p-3">
                <p className="text-sm font-mono text-code-foreground">{issue.suggestion}</p>
              </div>
            </div>

            {/* AI-Enhanced Suggestion */}
            {isAIAvailable() && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="font-medium text-sm flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-purple-400" /> AI Fix Suggestion
                  </h5>
                  {!aiSuggestion && !aiSuggestionLoading && (
                    <button
                      onClick={fetchAISuggestion}
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" /> Generate
                    </button>
                  )}
                </div>
                {aiSuggestionLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-purple-500/5 border border-purple-500/20">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-purple-400 border-t-transparent" />
                    <span className="text-xs text-muted-foreground">AI is analyzing this issue...</span>
                  </div>
                )}
                {aiSuggestion && (
                  <div className="rounded-md bg-purple-500/5 border border-purple-500/20 p-3">
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{aiSuggestion}</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded bg-background p-2 text-center">
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium capitalize">{issue.category.replace('-', ' ')}</p>
              </div>
              <div className="rounded bg-background p-2 text-center">
                <p className="text-muted-foreground">Severity</p>
                <p className="font-medium capitalize">{issue.severity}</p>
              </div>
              <div className="rounded bg-background p-2 text-center">
                <p className="text-muted-foreground">Impact</p>
                <p className="font-medium">
                  {issue.severity === 'critical' ? 'High' : 
                   issue.severity === 'warning' ? 'Medium' : 'Low'}
                </p>
              </div>
            </div>
          </div>
        </DialogContentSolid>
      </Dialog>
    </>
  );
}

interface TreeNode {
  name: string;
  issues?: number;
  children?: TreeNode[];
}

function buildFileTree(issues: ReviewIssue[]): TreeNode[] {
  // Count issues per file
  const fileCounts: Record<string, number> = {};
  for (const issue of issues) {
    fileCounts[issue.file] = (fileCounts[issue.file] || 0) + 1;
  }

  // Build tree structure from file paths
  const root: Record<string, any> = {};
  for (const [filePath, count] of Object.entries(fileCounts)) {
    const parts = filePath.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // File node
        current[part] = { __issues: count };
      } else {
        // Directory node
        if (!current[part] || current[part].__issues !== undefined) {
          current[part] = current[part] || {};
        }
        current = current[part];
      }
    }
  }

  // Convert to TreeNode array
  function toTreeNodes(obj: Record<string, any>): TreeNode[] {
    const nodes: TreeNode[] = [];
    const entries = Object.entries(obj).sort(([a], [b]) => {
      const aIsDir = typeof obj[a] === 'object' && obj[a].__issues === undefined;
      const bIsDir = typeof obj[b] === 'object' && obj[b].__issues === undefined;
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    for (const [key, value] of entries) {
      if (key === '__issues') continue;
      if (typeof value === 'object' && value.__issues !== undefined) {
        // File with issues
        nodes.push({ name: key, issues: value.__issues });
      } else if (typeof value === 'object') {
        // Directory
        nodes.push({ name: key, children: toTreeNodes(value) });
      }
    }
    return nodes;
  }

  return toTreeNodes(root);
}

function FileTree({ issues, onFileSelect, selectedFile }: { 
  issues: ReviewIssue[]; 
  onFileSelect: (file: string) => void;
  selectedFile?: string;
}) {
  const tree = buildFileTree(issues);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    setOpenFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderNode = (node: TreeNode, depth = 0, parentPath = '') => {
    const isFolder = !!node.children;
    const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;
    const isOpen = openFolders.has(nodePath);
    const isSelected = !isFolder && nodePath === selectedFile;

    return (
      <div key={node.name}>
        <div
          className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary/50 cursor-pointer ${
            isSelected ? 'bg-primary/20' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(nodePath);
            } else {
              onFileSelect(nodePath);
            }
          }}
        >
          {isFolder ? (
            <>
              <ChevronRight 
                className={`h-3 w-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} 
              />
              <Folder className={`h-4 w-4 ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
            </>
          ) : (
            <>
              <span className="w-3" />
              <File className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
            </>
          )}
          <span className="font-mono text-xs truncate">{node.name}</span>
          {node.issues && (
            <Badge variant={isSelected ? "default" : "destructive"} className="ml-auto h-5 px-1.5 text-[10px] shrink-0">
              {node.issues}
            </Badge>
          )}
        </div>
        {isFolder && isOpen && node.children && node.children.map((c) => renderNode(c, depth + 1, nodePath))}
      </div>
    );
  };

  return (
    <div className="space-y-0.5 max-h-[600px] overflow-y-auto">
      {tree.length > 0 ? tree.map((f) => renderNode(f)) : (
        <p className="text-sm text-muted-foreground text-center py-4">No files analyzed</p>
      )}
    </div>
  );
}

function AIInsightsPanel({ review }: { review: Review }) {
  const [insights, setInsights] = useState<AiReviewInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const fetchInsights = async () => {
    if (insights || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateReviewInsights({
        score: review.score,
        totalIssues: review.totalIssues || 0,
        critical: review.critical,
        warnings: review.warnings,
        improvements: review.improvements,
        issues: review.issues.slice(0, 30),
        languageStats: review.languageStats,
        recommendations: review.recommendations,
        linesOfCode: review.linesOfCode,
      });
      setInsights(result);
    } catch (err) {
      setError('AI analysis unavailable');
      console.warn('AI insights failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (isAIAvailable()) {
      fetchInsights();
    }
  }, [review.id]);

  if (!isAIAvailable()) return null;

  return (
    <Card className="glass-card border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-500/20">
              <Bot className="h-4 w-4 text-purple-400" />
            </div>
            AI Insights
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] gap-1">
              <Sparkles className="h-2.5 w-2.5" /> GPT-4o
            </Badge>
          </CardTitle>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center gap-3 py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-400 border-t-transparent" />
              <span className="text-sm text-muted-foreground">AI is analyzing your code review...</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-yellow-500/80">{error}</p>
          )}

          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                <p className="text-sm leading-relaxed text-foreground/90">{insights.summary}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Priority Fixes */}
                {insights.priorityFixes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> Priority Fixes
                    </h4>
                    <div className="space-y-1.5">
                      {insights.priorityFixes.map((fix, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-foreground/80">{fix}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Architecture Insights */}
                {insights.architectureInsights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-blue-400" /> Architecture
                    </h4>
                    <div className="space-y-1.5">
                      {insights.architectureInsights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                          <span className="text-foreground/80">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Notes */}
                {insights.securityNotes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-red-400" /> Security
                    </h4>
                    <div className="space-y-1.5">
                      {insights.securityNotes.map((note, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                          <span className="text-foreground/80">{note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Positives */}
                {insights.positives.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" /> Strengths
                    </h4>
                    <div className="space-y-1.5">
                      {insights.positives.map((pos, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                          <span className="text-foreground/80">{pos}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!loading && !insights && !error && (
            <button
              onClick={fetchInsights}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Sparkles className="h-4 w-4" /> Generate AI Insights
            </button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

const ReviewResults = () => {
  const { id } = useParams();
  
  // Load reviews from localStorage or fallback to mock data
  const [reviews, setReviews] = useState<Review[]>([]);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | undefined>();

  // Export review as JSON
  const handleExport = () => {
    if (!review) return;
    
    const exportData = {
      name: review.name,
      date: review.date,
      score: review.score,
      summary: {
        totalIssues: review.totalIssues || 0,
        critical: review.critical,
        warnings: review.warnings,
        improvements: review.improvements,
      },
      issues: review.issues.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        file: issue.file,
        line: issue.line,
        category: issue.category,
        severity: issue.severity,
        suggestion: issue.suggestion,
      })),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-${review.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${review.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    try {
      const storedReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
      const allReviews = [...storedReviews];
      setReviews(allReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      if (id) {
        const foundReview = reviews.find((r) => r.id === id);
        if (foundReview) {
          setReview(foundReview);
          setShowAllReviews(false);
        } else {
          // Fallback to first review if ID not found
          setReview(reviews[0]);
          setShowAllReviews(false);
        }
      } else {
        // No ID provided, show all reviews
        setShowAllReviews(true);
        setReview(null);
      }
    }
  }, [reviews, id]);

  // Filter issues by selected file
  const filteredIssues = selectedFile 
    ? review?.issues.filter(issue => issue.file === selectedFile) || []
    : review?.issues || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (showAllReviews) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link to="/code-review">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">All Reviews</h1>
            <p className="text-sm text-muted-foreground">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <Card key={r.id} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{r.name}</CardTitle>
                    <CardDescription>
                      {new Date(r.date).toLocaleDateString()} at {new Date(r.date).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        r.score >= 80
                          ? "text-success"
                          : r.score >= 60
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    >
                      {r.score}
                    </p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Issues Found:</span>
                    <span className="font-medium">{r.totalIssues || 0}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-destructive font-bold">{r.critical}</p>
                      <p className="text-muted-foreground">Critical</p>
                    </div>
                    <div className="text-center">
                      <p className="text-warning font-bold">{r.warnings}</p>
                      <p className="text-muted-foreground">Warnings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-info font-bold">{r.improvements}</p>
                      <p className="text-muted-foreground">Improvements</p>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link to={`/code-review/review/${r.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Review Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The requested review could not be found.
          </p>
          <Button asChild>
            <Link to="/code-review/review">View All Reviews</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reviews Found</h3>
          <p className="text-muted-foreground mb-4">
            Start by analyzing a GitHub repository or uploading files.
          </p>
          <Button asChild>
            <Link to="/code-review/review/new">Start Analysis</Link>
          </Button>
        </div>
      </div>
    );
  }

  const allCategories = Object.keys(categoryLabels) as ReviewCategory[];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link to="/code-review">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{review.name}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(review.date).toLocaleString()}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="glass-card flex items-center justify-center py-4">
          <div className="text-center">
            <p
              className={`text-4xl font-extrabold tabular-nums ${
                review.score >= 80
                  ? "text-success"
                  : review.score >= 60
                  ? "text-warning"
                  : "text-destructive"
              }`}
            >
              {review.score}
            </p>
            <p className="text-sm text-muted-foreground">Overall Score</p>
          </div>
        </Card>
        {[
          { label: "Critical", value: review.critical, color: "text-destructive" },
          { label: "Warnings", value: review.warnings, color: "text-warning" },
          { label: "Improvements", value: review.improvements, color: "text-info" },
        ].map((s) => (
          <Card key={s.label} className="glass-card flex items-center justify-center py-4">
            <div className="text-center">
              <p className={`text-3xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <AIInsightsPanel review={review} />

      <div className="grid gap-4 lg:grid-cols-4">
        {/* File tree */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" /> File Tree
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileTree 
              issues={review.issues} 
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />
          </CardContent>
        </Card>

        {/* Category tabs & issues */}
        <div className="lg:col-span-3">
          {selectedFile && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">{selectedFile}</span>
                <Badge variant="secondary">
                  {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedFile(undefined)}
              >
                Clear
              </Button>
            </div>
          )}
          
          <Tabs defaultValue="all">
            <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-full border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All ({filteredIssues.length})
              </TabsTrigger>
              {allCategories.map((cat) => {
                const count = filteredIssues.filter((i) => i.category === cat).length;
                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="rounded-full border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
                  >
                    {categoryIcons[cat]} {categoryLabels[cat]} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="all" className="mt-4 space-y-3">
              {filteredIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} reviewId={id!} />
              ))}
            </TabsContent>

            {allCategories.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-4 space-y-3">
                {filteredIssues
                  .filter((i) => i.category === cat)
                  .map((issue) => (
                    <IssueCard key={issue.id} issue={issue} reviewId={id!} />
                  ))}
                {filteredIssues.filter((i) => i.category === cat).length === 0 && (
                  <p className="py-8 text-center text-muted-foreground">
                    No issues in this category 🎉
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReviewResults;

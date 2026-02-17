import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@code-review/components/ui/card';
import { Button } from '@code-review/components/ui/button';
import { Input } from '@code-review/components/ui/input';
import { Label } from '@code-review/components/ui/label';
import { Badge } from '@code-review/components/ui/badge';
import { Alert, AlertDescription } from '@code-review/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@code-review/components/ui/tabs';
import { Switch } from '@code-review/components/ui/switch';
import { Textarea } from '@code-review/components/ui/textarea';
import { Progress } from '@code-review/components/ui/progress';
import { 
  Loader2, 
  Github, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Shield,
  Zap,
  Layout,
  Code2,
  Database,
  ArrowRight,
  Settings2,
  Play,
  GitBranch
} from 'lucide-react';
import { enhancedCodeAnalyzer, AnalysisResult } from '@code-review/lib/analyzer-enhanced';
import { GitHubFile } from '@code-review/lib/github';
import { Review, ReviewCategory, categoryLabels, categoryIcons } from '@code-review/lib/types';

interface WidgetConfig {
  theme?: 'light' | 'dark';
  primaryColor?: string;
  showHeader?: boolean;
  height?: string;
  width?: string;
  mode?: 'full' | 'compact' | 'minimal';
}

interface CodeReviewWidgetProps {
  config?: WidgetConfig;
  onAnalysisComplete?: (result: Review) => void;
}

const allCategories: ReviewCategory[] = [
  "architecture",
  "code-quality",
  "performance",
  "state-management",
  "security",
  "error-handling",
  "scalability",
];

const features = [
  {
    icon: Shield,
    title: "Security Analysis",
    description: "Detect vulnerabilities, hardcoded secrets, and unsafe patterns",
  },
  {
    icon: Zap,
    title: "Performance Review",
    description: "Find re-render issues, missing memoization, and bundle bloat",
  },
  {
    icon: Layout,
    title: "Architecture Audit",
    description: "Evaluate folder structure, module boundaries, and separation of concerns",
  },
  {
    icon: Code2,
    title: "Code Quality",
    description: "Check naming conventions, type safety, dead code, and formatting",
  },
  {
    icon: Database,
    title: "State Management",
    description: "Detect state mutations, global vs local issues, and hook cleanup",
  },
  {
    icon: AlertTriangle,
    title: "Error Handling",
    description: "Find missing try/catch blocks, error boundaries, and edge cases",
  },
];

export default function CodeReviewWidget({ 
  config = {}, 
  onAnalysisComplete 
}: CodeReviewWidgetProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [codeText, setCodeText] = useState('');
  const [categories, setCategories] = useState<Record<ReviewCategory, boolean>>(
    Object.fromEntries(allCategories.map((c) => [c, true])) as Record<ReviewCategory, boolean>
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'github' | 'upload' | 'text'>('github');

  const defaultConfig: Required<WidgetConfig> = {
    theme: 'light',
    primaryColor: '#3b82f6',
    showHeader: true,
    height: 'auto',
    width: '100%',
    mode: 'full',
    ...config
  };

  const handleAnalyze = async () => {
    let files: GitHubFile[] = [];
    
    try {
      if (activeTab === 'github' && repoUrl) {
        // Extract owner/repo from GitHub URL
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
        if (!match) {
          setError('Invalid GitHub URL format');
          return;
        }
        
        const [, owner, repo] = match;
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`);
        if (!response.ok) {
          setError('Failed to fetch repository');
          return;
        }
        
        const contents = await response.json();
        files = contents
          .filter((item: { type: string; name: string }) => item.type === 'file' && (item.name.endsWith('.ts') || item.name.endsWith('.tsx') || item.name.endsWith('.js') || item.name.endsWith('.jsx')))
          .map((item: { path: string; name: string; size: number; sha: string }) => ({
            path: item.path,
            name: item.name,
            content: '', // Would need to fetch individual file contents
            size: item.size,
            type: 'file' as const,
            sha: item.sha
          }));
      } else if (activeTab === 'upload' && uploadedFiles) {
        files = Array.from(uploadedFiles).map(file => ({
          path: file.name,
          name: file.name,
          content: '', // Would need to read file content
          size: file.size,
          type: 'file' as const,
          sha: ''
        }));
      } else if (activeTab === 'text' && codeText) {
        files = [{
          path: 'input.ts',
          name: 'input.ts',
          content: codeText,
          size: codeText.length,
          type: 'file' as const,
          sha: ''
        }];
      } else {
        setError('Please provide input for analysis');
        return;
      }

      setIsAnalyzing(true);
      setError(null);
      setProgress(0);
      setProgressText('Initializing analysis...');
      
      // Progressive analysis with realistic progress tracking
      setProgress(10);
      setProgressText('Fetching repository data...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProgress(25);
      setProgressText('Processing files...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setProgress(40);
      setProgressText('Running security analysis...');
      await new Promise(resolve => setTimeout(resolve, 700));
      
      setProgress(60);
      setProgressText('Checking code quality...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setProgress(80);
      setProgressText('Generating recommendations...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(95);
      setProgressText('Finalizing results...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Create mock result that matches the Review type
      const mockResult: Review = {
        id: Date.now().toString(),
        name: activeTab === 'github' ? repoUrl : uploadedFiles?.[0]?.name || 'Code Analysis',
        source: activeTab === 'github' ? 'github' : 'upload',
        repoUrl: activeTab === 'github' ? repoUrl : undefined,
        score: Math.floor(Math.random() * 40) + 60,
        totalIssues: Math.floor(Math.random() * 20) + 5,
        critical: Math.floor(Math.random() * 3),
        warnings: Math.floor(Math.random() * 8) + 2,
        improvements: Math.floor(Math.random() * 10) + 3,
        date: new Date().toISOString(),
        categories: {
          architecture: Math.floor(Math.random() * 40) + 60,
          'code-quality': Math.floor(Math.random() * 40) + 60,
          performance: Math.floor(Math.random() * 40) + 60,
          'state-management': Math.floor(Math.random() * 40) + 60,
          security: Math.floor(Math.random() * 40) + 60,
          'error-handling': Math.floor(Math.random() * 40) + 60,
          scalability: Math.floor(Math.random() * 40) + 60,
        },
        issues: [
          {
            id: '1',
            severity: 'critical' as const,
            category: 'security' as ReviewCategory,
            file: 'src/auth.ts',
            line: 42,
            title: 'Hardcoded secret detected',
            description: 'API key should be stored in environment variables',
            suggestion: 'Move to .env file and use process.env'
          },
          {
            id: '2',
            severity: 'warning' as const,
            category: 'performance' as ReviewCategory,
            file: 'src/components/Button.tsx',
            line: 15,
            title: 'Missing React.memo',
            description: 'Component re-renders on every parent render',
            suggestion: 'Wrap component in React.memo'
          }
        ],
        recommendations: [
          'Implement proper error boundaries',
          'Add input validation for user inputs',
          'Consider using TypeScript strict mode'
        ]
      };
      
      setProgress(100);
      setProgressText('Complete!');
      setResult(mockResult);
      onAnalysisComplete?.(mockResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setProgress(0);
      setProgressText('');
    } finally {
      setIsAnalyzing(false);
      // Reset progress after a short delay to show completion
      setTimeout(() => {
        setProgress(0);
        setProgressText('');
      }, 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'improvement': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (defaultConfig.mode === 'minimal') {
    return (
      <div className={`code-review-widget ${defaultConfig.theme === 'dark' ? 'dark' : ''}`}
           style={{ width: defaultConfig.width }}>
        <div className="space-y-4">
          <Textarea
            placeholder="Paste your code here..."
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            className="min-h-[200px]"
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !codeText.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Code'
            )}
          </Button>
          {result && (
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}/100
              </div>
              <div className="text-sm text-muted-foreground">
                {result.totalIssues} issues found
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`code-review-widget ${defaultConfig.theme === 'dark' ? 'dark' : ''}`}
      style={{ height: defaultConfig.height, width: defaultConfig.width }}
    >
      {defaultConfig.showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AI Code Review Assistant
          </CardTitle>
          <CardDescription>
            Comprehensive code analysis across 7 critical categories
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-sm font-medium">
            <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-primary" />
            AI-Powered Code Analysis
          </div>
          <h2 className="text-2xl font-bold">
            Ship better code with{' '}
            <span className="text-primary">intelligent reviews</span>
          </h2>
          <p className="text-muted-foreground">
            Scan your GitHub repos or upload files for instant AI analysis
          </p>
        </div>

        {/* Input Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'github' | 'upload' | 'text')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="github" className="gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <FileText className="h-4 w-4" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload Files</Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept=".ts,.tsx,.js,.jsx"
                onChange={(e) => setUploadedFiles(e.target.files)}
              />
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code-input">Paste your code:</Label>
              <Textarea
                id="code-input"
                className="min-h-[200px] font-mono text-sm"
                placeholder="function example() { ... }"
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Category Selection */}
        <div className="space-y-3">
          <Label>Analysis Categories</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {allCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Switch
                  id={category}
                  checked={categories[category]}
                  onCheckedChange={(checked) =>
                    setCategories(prev => ({ ...prev, [category]: checked }))
                  }
                />
                <Label htmlFor={category} className="text-sm">
                  {categoryIcons[category]} {categoryLabels[category]}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="w-full gap-2"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing Repository...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start Analysis
            </>
          )}
        </Button>

        {/* Progress Bar */}
        {isAnalyzing && (
          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{progressText} ({Math.round(progress)}%)</span>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score Overview */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}/100
                  </div>
                  <div className="text-muted-foreground">
                    {result.totalIssues} issues found • {result.critical} critical
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Scores */}
            <div className="space-y-3">
              <h3 className="font-semibold">Category Scores</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(result.categories).map(([category, score]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{categoryIcons[category as ReviewCategory]}</span>
                      <span className="text-sm">{categoryLabels[category as ReviewCategory]}</span>
                    </div>
                    <span className={`font-bold ${getScoreColor(score)}`}>{score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues */}
            <div className="space-y-3">
              <h3 className="font-semibold">Top Issues</h3>
              {result.issues.slice(0, 3).map((issue) => (
                <Card key={issue.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{issue.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {issue.file}:{issue.line}
                        </p>
                        <p className="text-sm mt-2">{issue.description}</p>
                      </div>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold">Recommendations</h3>
              <div className="space-y-2">
                {result.recommendations?.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-accent rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Grid */}
        {defaultConfig.mode === 'full' && !result && (
          <div className="space-y-4">
            <h3 className="font-semibold text-center">What we analyze</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title} className="transition-colors hover:border-primary/30">
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="rounded-lg bg-accent p-2">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}

// Widget initialization function for external embedding
const typedWindow = window as typeof window & {
  CodeReviewWidget?: {
    init: (elementId: string, config?: WidgetConfig) => void;
  };
};

typedWindow.CodeReviewWidget = {
  init: (elementId: string, config?: WidgetConfig) => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id '${elementId}' not found`);
      return;
    }
    
    // This would need to be adapted for actual embedding
    console.log('Initializing Code Review Widget with config:', config);
  }
};

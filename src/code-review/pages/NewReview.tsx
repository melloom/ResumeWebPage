import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Github,
  Upload,
  FileArchive,
  Settings2,
  Play,
  Check,
  AlertCircle,
  ChevronDown,
  GitBranch,
  Lock,
} from "lucide-react";
import { Button } from "@code-review/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@code-review/components/ui/card";
import { Input } from "@code-review/components/ui/input";
import { Label } from "@code-review/components/ui/label";
import { Switch } from "@code-review/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@code-review/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@code-review/components/ui/select";
import { categoryLabels, type ReviewCategory, Review } from "@code-review/lib/types";
import { useToast } from "@code-review/hooks/use-toast";
import { githubService, GitHubFile } from "@code-review/lib/github";
import { codeAnalyzer, AnalysisResult } from "@code-review/lib/analyzer";
import { enhancedCodeAnalyzer } from "@code-review/lib/analyzer-enhanced";
import { analyzeCodeWithAI, isAIAvailable } from "@code-review/lib/ai-review-service";
import { WebhookService } from "@code-review/lib/webhooks";
import { FileUpload } from "@code-review/components/FileUpload";
import GitHubConnectionStatus from "@code-review/components/GitHubConnectionStatus";
import { ExtendedAnalysisResult } from "@code-review/lib/extended-types";
import { saveReview } from "@code-review/lib/review-store";

const allCategories: ReviewCategory[] = [
  "architecture",
  "code-quality",
  "performance",
  "state-management",
  "security",
  "error-handling",
  "scalability",
];

const NewReview = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [categories, setCategories] = useState<Record<ReviewCategory, boolean>>(
    Object.fromEntries(allCategories.map((c) => [c, true])) as Record<ReviewCategory, boolean>
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [defaultTab, setDefaultTab] = useState("github");
  
  // GitHub connection state
  const [githubUser, setGithubUser] = useState<{ login: string; id: number } | null>(null);
  const [privateRepoEnabled, setPrivateRepoEnabled] = useState(false);
  const [userRepos, setUserRepos] = useState<{ id: number; full_name: string; private: boolean }[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  // Check for GitHub connection on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('github_user');
    const token = localStorage.getItem('github_token');
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        setGithubUser(user);
        fetchUserRepos(token);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }, []);

  // Fetch user repositories
  const fetchUserRepos = async (token: string) => {
    setIsLoadingRepos(true);
    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (response.ok) {
        const repos = await response.json();
        console.log('Fetched repos:', repos.map(r => ({ name: r.full_name, private: r.private })));
        setUserRepos(repos);
      }
    } catch (error) {
      console.error('Error fetching repos:', error);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  // Handle repository selection from dropdown
  const handleRepoSelect = (repoFullName: string) => {
    setSelectedRepo(repoFullName);
    setRepoUrl(`https://github.com/${repoFullName}`);
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "upload" || tab === "github") {
      setDefaultTab(tab);
    }
  }, [searchParams]);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    
    if (code) {
      handleOAuthTokenExchange(code);
    } else if (error) {
      toast({
        title: "OAuth Error",
        description: "GitHub authorization failed. Please try again.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  // Handle OAuth token exchange
  const handleOAuthTokenExchange = async (code: string) => {
    try {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv23liHo1YWmMoIENwg4';
      const clientSecret = import.meta.env.VITE_GITHUB_CLIENT_SECRET || '669ad7f4cc4dc717091065356a09d2bb92c02b3b';
      const redirectUri = `${import.meta.env.PROD ? 'https://mellowsites.com' : window.location.origin}/code-review/callback`;
      
      console.log('OAuth token exchange:', {
        clientId,
        redirectUri,
        code: code.substring(0, 10) + '...',
      });
      
      // Use Netlify Functions in production, local proxy in development
      const isProduction = import.meta.env.PROD;
      const apiUrl = isProduction 
        ? `${window.location.origin}/.netlify/functions/github-oauth`
        : 'http://localhost:3001/oauth/token';
      
      console.log('Using API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      
      if (data.access_token) {
        // Get user information
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        const userData = await userResponse.json();
        
        // Store user and token
        localStorage.setItem('github_user', JSON.stringify(userData));
        localStorage.setItem('github_token', data.access_token);
        
        setGithubUser(userData);
        fetchUserRepos(data.access_token);
        
        toast({
          title: "Connected to GitHub",
          description: `Successfully connected as ${userData.login}`,
        });
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/code-review/review/new');
      } else {
        throw new Error(data.error_description || 'Failed to get access token');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to GitHub. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleCategory = (cat: ReviewCategory) => {
    setCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Normalize codeChurn to expected shape (types.ts uses filesWithMostChanges)
  const normalizeCodeChurn = (codeChurn?: { totalChanges: number; churnRate: number; filesWithMostChanges?: { path: string; changes: number; additions: number; deletions: number; }[]; filesWithChanges?: { path: string; changes: number; additions: number; deletions: number; }[]; }) => {
    if (!codeChurn) {
      return {
        totalChanges: 0,
        filesWithMostChanges: [] as { path: string; changes: number; additions: number; deletions: number; }[],
        churnRate: 0,
      };
    }
    const filesWithMostChanges = codeChurn.filesWithMostChanges ?? codeChurn.filesWithChanges ?? [];
    return {
      totalChanges: codeChurn.totalChanges ?? 0,
      filesWithMostChanges,
      churnRate: codeChurn.churnRate ?? 0,
    };
  };

  // Analysis progress timer effect
  useEffect(() => {
    if (isAnalyzing && analysisStartTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - analysisStartTime;
        const progress = Math.min((elapsed / 30000) * 100, 95); // 30 seconds = 95% progress
        setAnalysisProgress(progress);
        
        if (progress >= 95) {
          clearInterval(interval);
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, analysisStartTime]);

  // Handle file upload analysis
  const handleFileAnalysis = async (analysisData: ExtendedAnalysisResult & { source: 'upload'; name: string; totalFiles: number }) => {
    setIsAnalyzing(true);
    setAnalysisStartTime(Date.now());
    setAnalysisProgress(0);
    
    // Send webhook notification
    await WebhookService.sendAnalysisStarted('Uploaded Files');

    try {
      // Run AI-powered deep analysis on uploaded files too
      if (isAIAvailable() && analysisData.parsedFiles) {
        try {
          const codeFiles = analysisData.parsedFiles
            .filter((f: any) => f.content && f.content.length > 0)
            .map((f: any) => ({ path: f.path, content: f.content }));
          const aiIssues = await analyzeCodeWithAI(codeFiles, analysisData.issues.length);
          if (aiIssues.length > 0) {
            analysisData.issues.push(...aiIssues);
          }
        } catch (aiErr) {
          console.warn('[AI Review] AI analysis failed for uploads, continuing:', aiErr);
        }
      }

      // Filter issues by enabled categories
      const enabledCategories = Object.entries(categories)
        .filter(([, enabled]) => enabled)
        .map(([cat]) => cat as ReviewCategory);
      const filteredIssues = analysisData.issues.filter(
        (issue) => enabledCategories.includes(issue.category)
      );

      // Filter category scores to only enabled categories
      const filteredCategoryScores = { ...analysisData.categoryScores };
      for (const cat of allCategories) {
        if (!categories[cat]) {
          filteredCategoryScores[cat] = 100; // Perfect score for disabled categories
        }
      }

      // Recalculate overall score from filtered issues
      const criticalCount = filteredIssues.filter(i => i.severity === 'critical').length;
      const warningCount = filteredIssues.filter(i => i.severity === 'warning').length;
      const improvementCount = filteredIssues.filter(i => i.severity === 'improvement').length;
      const lines = Math.max(analysisData.linesOfCode, 100);
      const weightedIssues = criticalCount * 10 + warningCount * 3 + improvementCount * 1;
      const density = weightedIssues / lines * 100;
      const filteredScore = Math.max(1, Math.min(100, Math.round(100 * Math.exp(-density / 80))));

      // Create review object with enhanced data
      const review: Review = {
        id: `rev-${Date.now()}`,
        name: analysisData.name,
        source: analysisData.source,
        score: filteredScore,
        totalIssues: filteredIssues.length,
        critical: criticalCount,
        warnings: warningCount,
        improvements: improvementCount,
        date: new Date().toISOString(),
        categories: filteredCategoryScores,
        issues: filteredIssues,
        // Add new fields with default values for missing properties
        linesOfCode: analysisData.linesOfCode,
        languageStats: analysisData.languageStats,
        summary: analysisData.summary,
        recommendations: analysisData.recommendations,
        complexityMetrics: analysisData.complexityMetrics || {
          averageComplexity: 0,
          maxComplexity: 0,
          complexFiles: []
        },
        duplicateCode: analysisData.duplicateCode || {
          duplicateBlocks: 0,
          duplicatedLines: 0,
          duplicationPercentage: 0
        },
        testCoverage: analysisData.testCoverage || {
          coverage: 0,
          testedFiles: 0,
          untestedFiles: []
        },
        // Advanced metrics with defaults
        codeSmells: analysisData.codeSmells || {
          totalSmells: 0,
          smellsByType: {},
          filesWithSmells: []
        },
        dependencies: analysisData.dependencies || {
          totalDependencies: 0,
          externalDependencies: 0,
          circularDependencies: [],
          unusedDependencies: []
        },
        codeMetrics: analysisData.codeMetrics || {
          averageFunctionLength: 0,
          maxFunctionLength: 0,
          averageParameterCount: 0,
          maxParameterCount: 0,
          nestedDepth: 0,
          coupling: {
            afferentCoupling: {},
            efferentCoupling: {},
            instability: {}
          }
        },
        securityVulnerabilities: analysisData.securityVulnerabilities || {
          vulnerabilities: [],
          riskScore: 0
        },
        // Premium features with defaults
        hotspots: analysisData.hotspots || {
          files: [],
          hotspotsByType: {}
        },
        codeChurn: normalizeCodeChurn(analysisData.codeChurn),
        technicalDebtRatio: analysisData.technicalDebtRatio || {
          principal: 0,
          interest: 0,
          ratio: 0,
          timeToPayOff: 0
        },
        codeHealth: analysisData.codeHealth || {
          overallHealth: 'good' as const,
          healthFactors: {},
          trends: {
            improving: [],
            declining: []
          }
        },
        performanceMetrics: analysisData.performanceMetrics || {
          bundleSize: 0,
          loadTime: 0,
          renderTime: 0,
          memoryUsage: 0,
          optimizationOpportunities: []
        },
      };

      // Check if user is authenticated before trying to save to Firestore
      const authToken = localStorage.getItem('github_token');
      if (authToken) {
        // User is authenticated, try to save to Firestore
        try {
          await saveReview(review);
        } catch (err) {
          console.warn('Firestore save failed, falling back to localStorage:', err);
          let existingReviews: Review[] = [];
          try {
            existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
          } catch {
            existingReviews = [];
          }
          existingReviews.push(review);
          localStorage.setItem('reviews', JSON.stringify(existingReviews));
        }
      } else {
        // User is not authenticated, save directly to localStorage
        let existingReviews: Review[] = [];
        try {
          existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        } catch {
          existingReviews = [];
        }
        existingReviews.push(review);
        localStorage.setItem('reviews', JSON.stringify(existingReviews));
      }
      
      // Emit event to update sidebar history
      window.dispatchEvent(new CustomEvent('review-updated', { detail: review }));

      // Send webhook notifications
      await WebhookService.sendReviewCreated(review);

      toast({
        title: "Analysis complete!",
        description: `Found ${filteredIssues.length} issues across ${analysisData.totalFiles} files`,
      });

      // Navigate to results
      navigate(`/code-review/review/${review.id}`);

    } catch (error) {
      console.error('Analysis error:', error);
      
      // Send error webhook
      await WebhookService.sendError(error instanceof Error ? error : new Error(String(error)));
      
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze files",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisStartTime(null);
    }
  };

  const hasEnabledCategories = Object.values(categories).some(Boolean);

  const startAnalysis = async () => {
    if (!repoUrl) return;

    setIsAnalyzing(true);
    toast({
      title: "Analysis started",
      description: "Fetching repository and analyzing code...",
    });

    // Send webhook notification
    await WebhookService.sendAnalysisStarted(repoUrl);

    try {
      // Parse GitHub URL
      const parsed = githubService.parseRepoUrl(repoUrl);
      if (!parsed) {
        throw new Error("Invalid GitHub repository URL");
      }

      const { owner, repo } = parsed;

      // Get GitHub token for private repo access
      const token = localStorage.getItem('github_token');
      const githubServiceWithToken = new (await import('@code-review/lib/github')).GitHubService(token || undefined);
      
      // Fetch repository info
      const repoInfo = await githubServiceWithToken.getRepo(owner, repo);
      
      // Check if repository is private and access is enabled
      if (repoInfo.private && !privateRepoEnabled) {
        throw new Error(
          "This is a private repository. Please enable private repository analysis in the GitHub Integration settings."
        );
      }
      
      // Fetch all code files
      const files = await githubServiceWithToken.getAllCodeFiles(owner, repo, repoInfo.default_branch);
      
      if (files.length === 0) {
        throw new Error("No code files found in repository");
      }

      // Perform enhanced code analysis with timeout
      const analysisPromise = enhancedCodeAnalyzer.analyzeFiles(files);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Analysis timeout - repository too large')), 30000)
      );

      const analysisResult = await Promise.race([analysisPromise, timeoutPromise]) as ExtendedAnalysisResult;

      // Run AI-powered deep code analysis in parallel (non-blocking)
      if (isAIAvailable()) {
        try {
          const codeFiles = files
            .filter((f) => f.content && f.content.length > 0)
            .map((f) => ({ path: f.path, content: f.content! }));
          const aiIssues = await analyzeCodeWithAI(codeFiles, analysisResult.issues.length);
          if (aiIssues.length > 0) {
            analysisResult.issues.push(...aiIssues);
          }
        } catch (aiErr) {
          console.warn('[AI Review] AI analysis failed, continuing with local results:', aiErr);
        }
      }

      // Filter issues by enabled categories
      const enabledCategories = Object.entries(categories)
        .filter(([, enabled]) => enabled)
        .map(([cat]) => cat as ReviewCategory);
      const filteredIssues = analysisResult.issues.filter(
        (issue) => enabledCategories.includes(issue.category)
      );

      // Filter category scores to only enabled categories
      const filteredCategoryScores = { ...analysisResult.categoryScores };
      for (const cat of allCategories) {
        if (!categories[cat]) {
          filteredCategoryScores[cat] = 100; // Perfect score for disabled categories
        }
      }

      // Recalculate overall score from filtered issues
      const criticalCount = filteredIssues.filter(i => i.severity === 'critical').length;
      const warningCount = filteredIssues.filter(i => i.severity === 'warning').length;
      const improvementCount = filteredIssues.filter(i => i.severity === 'improvement').length;
      const lines = Math.max(analysisResult.linesOfCode, 100);
      const weightedIssues = criticalCount * 10 + warningCount * 3 + improvementCount * 1;
      const density = weightedIssues / lines * 100;
      const filteredScore = Math.max(1, Math.min(100, Math.round(100 * Math.exp(-density / 80))));

      // Create review object with enhanced data
      const review: Review = {
        id: `rev-${Date.now()}`,
        name: repoInfo.full_name,
        source: "github",
        repoUrl: repoUrl,
        score: filteredScore,
        totalIssues: filteredIssues.length,
        critical: criticalCount,
        warnings: warningCount,
        improvements: improvementCount,
        date: new Date().toISOString(),
        categories: filteredCategoryScores,
        issues: filteredIssues,
        // Add new fields with default values for missing properties
        linesOfCode: analysisResult.linesOfCode,
        languageStats: analysisResult.languageStats,
        summary: analysisResult.summary,
        recommendations: analysisResult.recommendations,
        complexityMetrics: analysisResult.complexityMetrics || {
          averageComplexity: 0,
          maxComplexity: 0,
          complexFiles: []
        },
        duplicateCode: analysisResult.duplicateCode || {
          duplicateBlocks: 0,
          duplicatedLines: 0,
          duplicationPercentage: 0
        },
        testCoverage: analysisResult.testCoverage || {
          coverage: 0,
          testedFiles: 0,
          untestedFiles: []
        },
        // Advanced metrics with defaults
        codeSmells: analysisResult.codeSmells || {
          totalSmells: 0,
          smellsByType: {},
          filesWithSmells: []
        },
        dependencies: analysisResult.dependencies || {
          totalDependencies: 0,
          externalDependencies: 0,
          circularDependencies: [],
          unusedDependencies: []
        },
        codeMetrics: analysisResult.codeMetrics || {
          averageFunctionLength: 0,
          maxFunctionLength: 0,
          averageParameterCount: 0,
          maxParameterCount: 0,
          nestedDepth: 0,
          coupling: {
            afferentCoupling: {},
            efferentCoupling: {},
            instability: {}
          }
        },
        securityVulnerabilities: analysisResult.securityVulnerabilities || {
          vulnerabilities: [],
          riskScore: 0
        },
        // Premium features with defaults
        hotspots: analysisResult.hotspots || {
          files: [],
          hotspotsByType: {}
        },
        codeChurn: normalizeCodeChurn(analysisResult.codeChurn),
        technicalDebtRatio: analysisResult.technicalDebtRatio || {
          principal: 0,
          interest: 0,
          ratio: 0,
          timeToPayOff: 0
        },
        codeHealth: analysisResult.codeHealth || {
          overallHealth: 'good' as const,
          healthFactors: {},
          trends: {
            improving: [],
            declining: []
          }
        },
        performanceMetrics: analysisResult.performanceMetrics || {
          bundleSize: 0,
          loadTime: 0,
          renderTime: 0,
          memoryUsage: 0,
          optimizationOpportunities: []
        },
        // Store raw file content for code snippets
        rawFiles: files.reduce((acc, file) => {
          if (file.content) {
            acc[file.path] = file.content;
          }
          return acc;
        }, {} as Record<string, string>),
      };

      // Check if user is authenticated before trying to save to Firestore
      const authToken = localStorage.getItem('github_token');
      if (authToken) {
        // User is authenticated, try to save to Firestore
        try {
          await saveReview(review);
        } catch (err) {
          console.warn('Firestore save failed, falling back to localStorage:', err);
          let existingReviews: Review[] = [];
          try {
            existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
          } catch {
            existingReviews = [];
          }
          existingReviews.push(review);
          localStorage.setItem('reviews', JSON.stringify(existingReviews));
        }
      } else {
        // User is not authenticated, save directly to localStorage
        let existingReviews: Review[] = [];
        try {
          existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        } catch {
          existingReviews = [];
        }
        existingReviews.push(review);
        localStorage.setItem('reviews', JSON.stringify(existingReviews));
      }
      
      // Emit event to update sidebar history
      window.dispatchEvent(new CustomEvent('review-updated', { detail: review }));

      // Send webhook notifications
      await WebhookService.sendGitHubAnalysisComplete(review);
      await WebhookService.sendReviewCreated(review);

      toast({
        title: "Analysis complete!",
        description: `Found ${filteredIssues.length} issues across ${files.length} files`,
      });

      // Navigate to results
      navigate(`/code-review/review/${review.id}`);

    } catch (error) {
      console.error('Analysis error:', error);
      
      // Send error webhook
      await WebhookService.sendError(error instanceof Error ? error : new Error(String(error)));
      
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze repository",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisStartTime(null);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">New Review</h1>
        <p className="mt-1 text-muted-foreground">
          Connect a GitHub repo or upload files to begin AI-powered analysis
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* GitHub Connection Status */}
        <div className="lg:col-span-3">
          <GitHubConnectionStatus 
            onConnectionChange={(isConnected, user, privateRepoEnabled) => {
              if (isConnected && user) {
                setGithubUser({ login: user.login, id: parseInt(user.id) });
                setPrivateRepoEnabled(privateRepoEnabled);
                fetchUserRepos(localStorage.getItem('github_token')!);
              } else {
                setGithubUser(null);
                setPrivateRepoEnabled(false);
                setUserRepos([]);
                setSelectedRepo('');
              }
            }}
          />
        </div>

        {/* Source selection */}
        <div className="lg:col-span-2">
          <Tabs defaultValue={defaultTab}>
            <TabsList className="w-full">
              <TabsTrigger value="github" className="flex-1 gap-2">
                <Github className="h-4 w-4" /> GitHub Repository
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex-1 gap-2">
                <Upload className="h-4 w-4" /> Upload Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="github">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">GitHub Repository</CardTitle>
                  <CardDescription>
                    {githubUser 
                      ? `Connected as ${githubUser.login}` 
                      : "Enter a public repo URL or connect via GitHub OAuth"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                      <Label htmlFor="repo-select">Your Repositories</Label>
                      <Select
                        value={selectedRepo}
                        onValueChange={handleRepoSelect}
                        disabled={isLoadingRepos}
                      >
                        <SelectTrigger className="mt-1.5 font-mono text-sm">
                          <SelectValue placeholder="Connect GitHub to see your repositories" />
                        </SelectTrigger>
                        <SelectContent data-testid="repo-dropdown" className="data-[side=top]:hidden max-h-60 overflow-auto z-[9999] !bg-slate-900 !border-slate-700 shadow-lg">
                          {userRepos.map((repo) => {
                            console.log('Rendering repo:', repo.full_name, 'private:', repo.private);
                            return (
                            <SelectItem key={repo.id} value={repo.full_name}>
                              <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                <span>{repo.full_name}</span>
                                {repo.private && (
                                  <Lock className="h-3 w-3 text-orange-500" />
                                )}
                              </div>
                            </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {!githubUser && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Connect GitHub to see your repositories
                        </p>
                      )}
                    </div>
                  <div>
                    <Label htmlFor="repo-url">Repository URL</Label>
                    <Input
                      id="repo-url"
                      placeholder="https://github.com/owner/repo"
                      value={repoUrl}
                      onChange={(e) => {
                        setRepoUrl(e.target.value);
                        setSelectedRepo("");
                      }}
                      className="mt-1.5 font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={startAnalysis}
                      disabled={!repoUrl || isAnalyzing || !hasEnabledCategories}
                      className="gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-t-transparent border-white animate-spin rounded-full" />
                            <span>Analyzing... {Math.round(analysisProgress)}%</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" /> Start Analysis
                        </>
                      )}
                    </Button>
                    {!githubUser && (
                      <Button variant="outline" className="gap-2" onClick={() => {
                        // Trigger GitHub OAuth flow
                        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv23liHo1YWmMoIENwg4';
                        const redirectUri = encodeURIComponent(`${import.meta.env.PROD ? 'https://mellowsites.com' : window.location.origin}/code-review/callback`);
                        const scope = encodeURIComponent('user:email repo public_repo read:org');
                        const state = encodeURIComponent('github');
                        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
                        window.location.href = authUrl;
                      }}>
                        <Github className="h-4 w-4" /> Connect with GitHub
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload">
              <FileUpload 
                onFilesAnalyzed={handleFileAnalysis}
                disabled={isAnalyzing || !hasEnabledCategories}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Configuration */}
        <Card className="glass-card h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings2 className="h-4 w-4" /> Review Categories
            </CardTitle>
            <CardDescription>Toggle categories to include</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {allCategories.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
              >
                <Label
                  htmlFor={cat}
                  className="cursor-pointer text-sm font-normal"
                >
                  {categoryLabels[cat]}
                </Label>
                <Switch
                  id={cat}
                  checked={categories[cat]}
                  onCheckedChange={() => toggleCategory(cat)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewReview;

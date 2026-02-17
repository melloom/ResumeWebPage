import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  GitPullRequest,
  Play,
  Plus,
  Minus,
  MessageSquare,
  FileCode,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  User,
  Clock,
  GitMerge,
  ExternalLink,
  Loader2,
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
import { Badge } from "@code-review/components/ui/badge";
import { Progress } from "@code-review/components/ui/progress";
import { useToast } from "@code-review/hooks/use-toast";
import {
  GitHubService,
  GitHubPullRequest,
  ParsedFileDiff,
  DiffLine,
} from "@code-review/lib/github";
import { enhancedCodeAnalyzer } from "@code-review/lib/analyzer-enhanced";
import { WebhookService } from "@code-review/lib/webhooks";
import { Severity } from "@code-review/lib/types";

interface PRComment {
  file: string;
  line: number;
  text: string;
  severity: Severity;
  category: string;
  suggestion?: string;
}

interface PRAnalysisResult {
  score: number;
  comments: PRComment[];
  totalAdditions: number;
  totalDeletions: number;
  filesReviewed: number;
  summary: string;
}

const severityIcon = (severity: Severity) => {
  switch (severity) {
    case "critical":
      return <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />;
    case "improvement":
      return <Lightbulb className="h-4 w-4 text-info flex-shrink-0" />;
  }
};

const severityColor = (severity: Severity) => {
  switch (severity) {
    case "critical":
      return "border-destructive/30 bg-destructive/5";
    case "warning":
      return "border-warning/30 bg-warning/5";
    case "improvement":
      return "border-info/20 bg-info/5";
  }
};

const PRReview = () => {
  const [prUrl, setPrUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [prData, setPrData] = useState<GitHubPullRequest | null>(null);
  const [fileDiffs, setFileDiffs] = useState<ParsedFileDiff[]>([]);
  const [analysisResult, setAnalysisResult] = useState<PRAnalysisResult | null>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleFile = useCallback((filename: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  }, []);

  const getCommentsForFile = useCallback(
    (filename: string) =>
      analysisResult?.comments.filter((c) => c.file === filename) || [],
    [analysisResult]
  );

  const startAnalysis = async () => {
    if (!prUrl) return;

    setIsAnalyzing(true);
    setProgress(0);
    setProgressText("Parsing PR URL...");
    setPrData(null);
    setFileDiffs([]);
    setAnalysisResult(null);

    try {
      // Get token for authenticated access
      const token = localStorage.getItem("github_token") || undefined;
      const github = new GitHubService(token);

      // Parse the PR URL
      const parsed = github.parsePrUrl(prUrl);
      if (!parsed) {
        throw new Error(
          "Invalid PR URL. Use format: https://github.com/owner/repo/pull/123"
        );
      }

      const { owner, repo, pullNumber } = parsed;

      // Fetch PR metadata
      setProgress(10);
      setProgressText("Fetching pull request...");
      const pr = await github.getPullRequest(owner, repo, pullNumber);
      setPrData(pr);

      // Fetch changed files
      setProgress(25);
      setProgressText(`Fetching ${pr.changed_files} changed files...`);
      const prFiles = await github.getPullRequestFiles(owner, repo, pullNumber);

      // Parse diffs
      setProgress(40);
      setProgressText("Parsing diffs...");
      const parsedDiffs = github.parseFileDiffs(prFiles);
      setFileDiffs(parsedDiffs);

      // Expand all files by default
      setExpandedFiles(new Set(parsedDiffs.map((f) => f.filename)));

      // Fetch full file content for changed files and run analysis
      setProgress(50);
      setProgressText("Fetching file contents for analysis...");

      const codeExtensions = [
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        ".py",
        ".java",
        ".cpp",
        ".c",
        ".go",
        ".rs",
      ];
      const codeFiles = prFiles.filter((f) => {
        const ext = f.filename.includes(".")
          ? "." + f.filename.split(".").pop()?.toLowerCase()
          : "";
        return codeExtensions.includes(ext) && f.status !== "removed";
      });

      // Fetch content for each changed file
      const githubFiles = [];
      for (let i = 0; i < codeFiles.length; i++) {
        const file = codeFiles[i];
        const pct = 50 + Math.round((i / Math.max(codeFiles.length, 1)) * 30);
        setProgress(pct);
        setProgressText(`Analyzing ${file.filename}...`);

        try {
          const content = await github.getPullRequestFileContent(
            owner,
            repo,
            file.filename,
            pr.head.sha
          );
          githubFiles.push({
            name: file.filename.split("/").pop() || file.filename,
            path: file.filename,
            type: "file" as const,
            content,
            sha: file.sha,
            size: content.length,
          });
        } catch {
          console.warn(`Could not fetch content for ${file.filename}`);
        }
      }

      // Run the code analyzer on the fetched files
      setProgress(80);
      setProgressText("Running code analysis...");

      let comments: PRComment[] = [];
      let score = 100;

      if (githubFiles.length > 0) {
        const analysisPromise = enhancedCodeAnalyzer.analyzeFiles(githubFiles);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Analysis timeout - PR too large")),
            60000
          )
        );

        const result = await Promise.race([analysisPromise, timeoutPromise]) as Awaited<ReturnType<typeof enhancedCodeAnalyzer.analyzeFiles>>;
        score = result.score;

        // Map analysis issues to PR comments (only for changed lines)
        const changedLinesByFile = new Map<string, Set<number>>();
        for (const diff of parsedDiffs) {
          const lines = new Set<number>();
          for (const line of diff.lines) {
            if (line.type === "added" && line.newLine !== null) {
              lines.add(line.newLine);
            }
          }
          changedLinesByFile.set(diff.filename, lines);
        }

        comments = result.issues
          .filter((issue) => {
            const changedLines = changedLinesByFile.get(issue.file);
            return changedLines && changedLines.has(issue.line);
          })
          .map((issue) => ({
            file: issue.file,
            line: issue.line,
            text: issue.title + (issue.description ? `: ${issue.description}` : ""),
            severity: issue.severity,
            category: issue.category,
            suggestion: issue.suggestion,
          }));

        // If we found no comments on changed lines, add top issues as general comments
        if (comments.length === 0 && result.issues.length > 0) {
          comments = result.issues.slice(0, 10).map((issue) => ({
            file: issue.file,
            line: issue.line,
            text: issue.title + (issue.description ? `: ${issue.description}` : ""),
            severity: issue.severity,
            category: issue.category,
            suggestion: issue.suggestion,
          }));
        }
      }

      setProgress(95);
      setProgressText("Generating summary...");

      const totalAdditions = pr.additions;
      const totalDeletions = pr.deletions;
      const criticalCount = comments.filter((c) => c.severity === "critical").length;
      const warningCount = comments.filter((c) => c.severity === "warning").length;

      let summary = `Reviewed ${prFiles.length} files with ${totalAdditions} additions and ${totalDeletions} deletions. `;
      if (comments.length === 0) {
        summary += "No issues found - looking good!";
      } else {
        summary += `Found ${comments.length} issues`;
        if (criticalCount > 0) summary += ` (${criticalCount} critical)`;
        if (warningCount > 0) summary += ` (${warningCount} warnings)`;
        summary += ".";
      }

      const analysisResultData: PRAnalysisResult = {
        score,
        comments,
        totalAdditions,
        totalDeletions,
        filesReviewed: prFiles.length,
        summary,
      };

      setAnalysisResult(analysisResultData);
      setProgress(100);
      setProgressText("Complete!");

      // Send webhook
      await WebhookService.sendPRReviewComplete(
        prUrl,
        pullNumber,
        pr.title,
        score,
        comments.length,
        prFiles.length,
        totalAdditions,
        totalDeletions,
        comments.map((c) => ({
          file: c.file,
          line: c.line,
          text: c.text,
          severity: c.severity,
        }))
      );

      toast({
        title: "PR Review Complete",
        description: `Found ${comments.length} issues across ${prFiles.length} files`,
      });
    } catch (error) {
      console.error("PR analysis error:", error);
      await WebhookService.sendError(
        error instanceof Error ? error : new Error(String(error))
      );
      toast({
        title: "PR Analysis Failed",
        description:
          error instanceof Error ? error.message : "Failed to analyze PR",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderDiffLine = (
    line: DiffLine,
    idx: number,
    fileComments: PRComment[]
  ) => {
    const comment = fileComments.find(
      (c) =>
        line.type === "added" &&
        line.newLine !== null &&
        c.line === line.newLine
    );

    if (line.type === "header") {
      return (
        <div key={idx} className="bg-muted/50 px-4 py-1 font-mono text-xs text-muted-foreground">
          {line.content}
        </div>
      );
    }

    return (
      <div key={idx}>
        <div
          className={`flex font-mono text-sm ${
            line.type === "added"
              ? "bg-success/10"
              : line.type === "removed"
              ? "bg-destructive/10"
              : ""
          }`}
        >
          <span className="w-12 flex-shrink-0 select-none px-3 py-1 text-right text-xs text-muted-foreground">
            {line.oldLine ?? ""}
          </span>
          <span className="w-12 flex-shrink-0 select-none px-3 py-1 text-right text-xs text-muted-foreground">
            {line.newLine ?? ""}
          </span>
          <span className="w-6 flex-shrink-0 select-none py-1 text-center text-xs">
            {line.type === "added"
              ? "+"
              : line.type === "removed"
              ? "−"
              : " "}
          </span>
          <span className="flex-1 py-1 pr-4">
            <span
              className={
                line.type === "added"
                  ? "text-success"
                  : line.type === "removed"
                  ? "text-destructive"
                  : "text-code-foreground"
              }
            >
              {line.content}
            </span>
          </span>
        </div>
        {comment && (
          <div className={`flex border-y border-border/30 ${severityColor(comment.severity)}`}>
            <span className="w-12 flex-shrink-0" />
            <span className="w-12 flex-shrink-0" />
            <span className="w-6 flex-shrink-0" />
            <div className="flex-1 px-3 py-2">
              <div className="flex items-start gap-2 rounded-md border border-border/30 bg-card p-3">
                {severityIcon(comment.severity)}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        comment.severity === "critical"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {comment.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {comment.category}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.text}</p>
                  {comment.suggestion && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Suggestion: {comment.suggestion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Pull Request Review</h1>
        <p className="mt-1 text-muted-foreground">
          Analyze a GitHub PR with AI-generated inline comments on changed code
        </p>
      </div>

      {/* PR Input */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GitPullRequest className="h-4 w-4" /> Pull Request URL
          </CardTitle>
          <CardDescription>
            Paste a GitHub PR URL to fetch the diff and run code analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pr-url">GitHub Pull Request URL</Label>
            <Input
              id="pr-url"
              placeholder="https://github.com/owner/repo/pull/123"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              className="mt-1.5 font-mono text-sm"
              disabled={isAnalyzing}
            />
          </div>
          <Button
            onClick={startAnalysis}
            disabled={!prUrl || isAnalyzing}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Analyze PR
              </>
            )}
          </Button>

          {/* Progress bar */}
          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{progressText}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PR Metadata */}
      {prData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold truncate">
                    {prData.title}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {prData.user.login}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitMerge className="h-3.5 w-3.5" />
                      {prData.head.ref} → {prData.base.ref}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(prData.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <a
                  href={prData.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="h-3.5 w-3.5" /> View on GitHub
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Score + Summary */}
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold ${
                    analysisResult.score >= 80
                      ? "bg-success/10 text-success"
                      : analysisResult.score >= 50
                      ? "bg-warning/10 text-warning"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {analysisResult.score}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.summary}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Badge className="bg-success/10 text-success gap-1">
                  <Plus className="h-3 w-3" /> {analysisResult.totalAdditions}{" "}
                  added
                </Badge>
                <Badge className="bg-destructive/10 text-destructive gap-1">
                  <Minus className="h-3 w-3" /> {analysisResult.totalDeletions}{" "}
                  removed
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <FileCode className="h-3 w-3" />{" "}
                  {analysisResult.filesReviewed} files
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <MessageSquare className="h-3 w-3" />{" "}
                  {analysisResult.comments.length} comments
                </Badge>
                {analysisResult.comments.filter((c) => c.severity === "critical")
                  .length > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />{" "}
                    {
                      analysisResult.comments.filter(
                        (c) => c.severity === "critical"
                      ).length
                    }{" "}
                    critical
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Diffs */}
          {fileDiffs.map((fileDiff) => {
            const isExpanded = expandedFiles.has(fileDiff.filename);
            const fileComments = getCommentsForFile(fileDiff.filename);

            return (
              <Card key={fileDiff.filename} className="glass-card overflow-hidden">
                <button
                  onClick={() => toggleFile(fileDiff.filename)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <FileCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-mono text-sm truncate">
                    {fileDiff.filename}
                  </span>
                  <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                    {fileComments.length > 0 && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {fileComments.length}
                      </Badge>
                    )}
                    <Badge
                      variant={
                        fileDiff.status === "added"
                          ? "default"
                          : fileDiff.status === "removed"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {fileDiff.status}
                    </Badge>
                    <span className="text-xs text-success">
                      +{fileDiff.additions}
                    </span>
                    <span className="text-xs text-destructive">
                      -{fileDiff.deletions}
                    </span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-border/50 overflow-x-auto">
                    {fileDiff.lines.length > 0 ? (
                      fileDiff.lines.map((line, idx) =>
                        renderDiffLine(line, idx, fileComments)
                      )
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Binary file or no diff available
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          {/* All Comments Summary */}
          {analysisResult.comments.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4" /> All Review Comments (
                  {analysisResult.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.comments.map((comment, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${severityColor(
                      comment.severity
                    )}`}
                  >
                    {severityIcon(comment.severity)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <code className="font-mono">{comment.file}</code>
                        <span>line {comment.line}</span>
                        <Badge variant="secondary" className="text-xs">
                          {comment.category}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm">{comment.text}</p>
                      {comment.suggestion && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Suggestion: {comment.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PRReview;

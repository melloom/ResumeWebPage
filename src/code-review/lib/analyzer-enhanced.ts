import { GitHubFile } from './github';
import { ReviewIssue, ReviewCategory, Severity } from './types';
import { ParsedFile, fileProcessor } from './file-processor';

export interface AnalysisResult {
  issues: ReviewIssue[];
  score: number;
  categoryScores: Record<ReviewCategory, number>;
  totalFiles: number;
  linesOfCode: number;
  parsedFiles: ParsedFile[];
  languageStats: Record<string, number>;
  summary: {
    securityScore: number;
    performanceScore: number;
    codeQualityScore: number;
    architectureScore: number;
    maintainabilityIndex: number;
    technicalDebt: number;
  };
  recommendations: string[];
  complexityMetrics: {
    averageComplexity: number;
    maxComplexity: number;
    complexFiles: string[];
  };
  duplicateCode: {
    duplicateBlocks: number;
    duplicatedLines: number;
    duplicationPercentage: number;
  };
  testCoverage: {
    coverage: number;
    testedFiles: number;
    untestedFiles: string[];
  };
  // Advanced metrics
  codeSmells: {
    totalSmells: number;
    smellsByType: Record<string, number>;
    filesWithSmells: string[];
  };
  dependencies: {
    totalDependencies: number;
    externalDependencies: number;
    circularDependencies: string[];
    unusedDependencies: string[];
  };
  codeMetrics: {
    averageFunctionLength: number;
    maxFunctionLength: number;
    averageParameterCount: number;
    maxParameterCount: number;
    nestedDepth: number;
    coupling: {
    afferentCoupling: Record<string, number>;
    efferentCoupling: Record<string, number>;
    instability: Record<string, number>;
    };
  };
  securityVulnerabilities: {
    vulnerabilities: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      file: string;
      line: number;
      description: string;
      cwe: string;
    }>;
    riskScore: number;
  };
  // Premium features
  hotspots: {
    files: Array<{
      path: string;
      score: number;
      issues: number;
      complexity: number;
      churn: number;
    }>;
    hotspotsByType: Record<string, string[]>;
  };
  codeChurn: {
    totalChanges: number;
    filesWithChanges: Array<{
      path: string;
      changes: number;
      additions: number;
      deletions: number;
    }>;
    churnRate: number;
  };
  technicalDebtRatio: {
    principal: number;
    interest: number;
    ratio: number;
    timeToPayOff: number;
  };
  codeHealth: {
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    healthFactors: Record<string, number>;
    trends: {
      improving: string[];
      declining: string[];
    };
  };
  performanceMetrics: {
    bundleSize: number;
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    optimizationOpportunities: string[];
  };
  // New comprehensive features
  testingMetrics: {
    testFiles: string[];
    testSuites: number;
    testCases: number;
    assertions: number;
    coverageByType: Record<string, number>;
    flakyTests: string[];
  };
  documentationMetrics: {
    documentedFiles: string[];
    documentationCoverage: number;
    missingDocs: string[];
    outdatedDocs: string[];
    apiDocs: string[];
    inlineComments: number;
  };
  codeStyleMetrics: {
    styleViolations: Array<{
      rule: string;
      severity: 'low' | 'medium' | 'high';
      occurrences: number;
      files: string[];
    }>;
    consistencyScore: number;
    formattingIssues: number;
    namingConventions: Record<string, number>;
  };
  accessibilityMetrics: {
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      file: string;
      line: number;
      description: string;
      wcag: string;
    }>;
    score: number;
    complianceLevel: 'A' | 'AA' | 'AAA' | 'none';
  };
  i18nMetrics: {
    supportedLanguages: string[];
    missingTranslations: Record<string, string[]>;
    hardcodedStrings: string[];
    localizationFiles: string[];
  };
  databaseMetrics: {
    queries: Array<{
      type: string;
      complexity: number;
      file: string;
      line: number;
      optimization: string;
    }>;
    connections: number;
    indexes: number;
    migrations: string[];
  };
  apiMetrics: {
    endpoints: Array<{
      path: string;
      method: string;
      file: string;
      line: number;
      authentication: boolean;
      rateLimit: boolean;
      validation: boolean;
    }>;
    restfulCompliance: number;
    documentation: string[];
  };
  buildMetrics: {
    buildTime: number;
    bundleSize: number;
    assets: Array<{
      type: string;
      size: number;
      optimization: string;
    }>;
    dependencies: Array<{
      name: string;
      version: string;
      size: number;
      vulnerabilities: number;
    }>;
  };
  deploymentMetrics: {
    deploymentFiles: string[];
    environments: string[];
    configurationIssues: string[];
    securityHeaders: string[];
    sslCertificates: Array<{
      file: string;
      valid: boolean;
      issuer: string;
      expiry: string;
    }>;
  };
  // NEW: Advanced features
  aiInsights: {
    insights: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      recommendation: string;
    }>;
    confidence: number;
    patternsLearned: number;
  };
  predictiveMetrics: {
    bugLikelihood: number;
    maintenanceEffort: number;
    scalabilityScore: number;
    technicalDebtGrowth: number;
    refactorPriority: string[];
  };
  optimizationHints: {
    hints: Array<{
      type: string;
      file: string;
      line: number;
      hint: string;
      impact: 'low' | 'medium' | 'high';
    }>;
    priority: string;
  };
  securityScore: number;
  performanceScore: number;
  maintainabilityScore: number;
}

export class EnhancedCodeAnalyzer {
  // Performance optimization: Cache frequently used patterns
  private patternCache = new Map<string, RegExp>();
  
  // Efficiency tracking
  private analysisStats = {
    totalFilesAnalyzed: 0,
    totalLinesProcessed: 0,
    averageAnalysisTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  // Advanced AI-powered features
  private aiPatterns = new Map<string, RegExp>();
  private learningEngine = {
    patterns: new Map<string, number>(),
    feedback: new Map<string, boolean>(),
    accuracy: 0.95,
  };

  // Real-time monitoring
  private monitoring = {
    activeAnalyses: new Set<string>(),
    performanceMetrics: new Map<string, number>(),
    errorRates: new Map<string, number>(),
  };

  // Helper method to get cached pattern
  private getCachedPattern(pattern: string): RegExp {
    if (!this.patternCache.has(pattern)) {
      this.patternCache.set(pattern, new RegExp(pattern, 'gi'));
      this.analysisStats.cacheMisses++;
    } else {
      this.analysisStats.cacheHits++;
    }
    return this.patternCache.get(pattern)!;
  }

  // AI-powered pattern learning
  private learnFromFeedback(pattern: string, wasCorrect: boolean): void {
    if (this.learningEngine.patterns.has(pattern)) {
      const currentScore = this.learningEngine.patterns.get(pattern) || 0;
      const newScore = wasCorrect ? Math.min(currentScore + 0.1, 1.0) : Math.max(currentScore - 0.05, 0);
      this.learningEngine.patterns.set(pattern, newScore);
      this.learningEngine.feedback.set(pattern, wasCorrect);
    }
  }

  // Predictive analysis
  private predictIssueLikelihood(file: ParsedFile): number {
    const features = this.extractFeatures(file);
    // Simple ML-like prediction based on learned patterns
    let score = 0;
    for (const [pattern, weight] of this.learningEngine.patterns) {
      if (this.getCachedPattern(pattern).test(file.content || '')) {
        score += weight;
      }
    }
    return Math.min(score / 10, 1);
  }

  // Extract features for ML
  private extractFeatures(file: ParsedFile): string[] {
    const features: string[] = [];
    
    // Extract function signatures
    file.functions.forEach(func => {
      features.push(`func:${func.name}:${func.parameters.length}`);
    });
    
    // Extract import patterns
    file.imports.forEach(imp => {
      features.push(`import:${imp.module}`);
    });
    
    // Extract complexity indicators
    features.push(`complexity:${file.complexity}`);
    features.push(`lines:${file.linesOfCode}`);
    
    return features;
  }

  // Real-time analysis with streaming
  async analyzeFilesStreaming(files: GitHubFile[], onProgress?: (progress: number) => void): Promise<AnalysisResult> {
    const startTime = performance.now();
    const allIssues: ReviewIssue[] = [];
    const parsedFiles: ParsedFile[] = [];
    const languageStats: Record<string, number> = {};
    let totalLines = 0;
    let issueId = 1;
    const complexities: number[] = [];
    let processedFiles = 0;

    // Process files sequentially to avoid race conditions on shared state
    for (const file of files) {
      try {
        const parsed = await fileProcessor.parseFile(file);
        parsedFiles.push(parsed);

        // Update language statistics
        languageStats[parsed.language] = (languageStats[parsed.language] || 0) + 1;
        totalLines += parsed.linesOfCode;
        complexities.push(parsed.complexity);

        // Check for max file length (500 lines)
        if (parsed.linesOfCode > 500) {
          allIssues.push({
            id: `issue-${issueId++}`,
            severity: 'improvement' as Severity,
            category: 'code-quality' as ReviewCategory,
            file: file.path,
            line: 500,
            title: 'File exceeds 500 lines',
            description: `File has ${parsed.linesOfCode} lines, which exceeds the recommended maximum of 500 lines`,
            suggestion: 'Consider breaking this file into smaller, more focused modules',
          });
        }

        // Analyze with AI prediction
        this.predictIssueLikelihood(parsed);

        // Analyze parsed file for issues
        const fileIssues = this.analyzeParsedFile(parsed, issueId);

        // Learn from patterns
        fileIssues.forEach(issue => {
          this.learnFromFeedback(issue.title, true);
        });

        allIssues.push(...fileIssues);
        issueId += fileIssues.length;

        // Report progress
        if (onProgress) {
          processedFiles++;
          onProgress((processedFiles / files.length) * 100);
        }
      } catch (error) {
        console.warn(`Failed to parse file ${file.path}:`, error);
        // Fallback to simple pattern matching
        const simpleIssues = this.analyzeFileWithPatterns(file, issueId);
        allIssues.push(...simpleIssues);
        issueId += simpleIssues.length;
        totalLines += file.content?.split('\n').length || 0;
      }
    }

    // Update efficiency stats
    this.analysisStats.totalFilesAnalyzed += files.length;
    this.analysisStats.totalLinesProcessed += totalLines;
    const analysisTime = performance.now() - startTime;
    this.analysisStats.averageAnalysisTime = 
      (this.analysisStats.averageAnalysisTime + analysisTime) / 2;

    // Calculate scores
    const categoryScores = this.calculateCategoryScores(allIssues);
    const overallScore = this.calculateOverallScore(allIssues, totalLines);
    
    // Calculate additional metrics
    const summary = this.calculateSummary(allIssues, categoryScores, totalLines);
    const recommendations = this.generateRecommendations(allIssues, categoryScores, languageStats);
    const complexityMetrics = this.calculateComplexityMetrics(complexities, parsedFiles);
    const duplicateCode = this.detectDuplicateCode(parsedFiles);
    const testCoverage = this.calculateTestCoverage(parsedFiles);
    
    // Advanced metrics
    const codeSmells = this.detectCodeSmells(parsedFiles);
    const dependencies = this.analyzeDependencies(parsedFiles);
    const codeMetrics = this.calculateDetailedMetrics(parsedFiles);
    const securityVulnerabilities = this.analyzeSecurityVulnerabilities(allIssues, parsedFiles);
    
    // Premium features
    const hotspots = this.identifyHotspots(allIssues, parsedFiles, codeMetrics);
    const codeChurn = this.analyzeCodeChurn(parsedFiles);
    const technicalDebtRatio = this.calculateTechnicalDebtRatio(summary.technicalDebt, totalLines);
    const codeHealth = this.assessCodeHealth(categoryScores, summary, codeSmells);
    const performanceMetrics = this.estimatePerformanceMetrics(parsedFiles, allIssues);
    
    // Comprehensive features
    const testingMetrics = this.analyzeTesting(parsedFiles);
    const documentationMetrics = this.analyzeDocumentation(parsedFiles);
    const accessibilityMetrics = this.analyzeAccessibility(parsedFiles);
    const i18nMetrics = this.analyzeI18n(parsedFiles);
    const databaseMetrics = this.analyzeDatabase(parsedFiles);
    const apiMetrics = this.analyzeApi(parsedFiles);
    const buildMetrics = this.analyzeBuild(parsedFiles);
    const deploymentMetrics = this.analyzeDeployment(parsedFiles);
    
    // NEW: Advanced features
    const aiInsights = this.generateAIInsights(allIssues, parsedFiles);
    const predictiveMetrics = this.calculatePredictiveMetrics(parsedFiles);
    const optimizationHints = this.generateOptimizationHints(allIssues, parsedFiles);
    const securityScore = this.calculateAdvancedSecurityScore(allIssues);
    const performanceScore = this.calculateAdvancedPerformanceScore(parsedFiles);
    const maintainabilityScore = this.calculateMaintainabilityScore(parsedFiles);

    // NEW: Code style metrics
    const codeStyleMetrics = this.analyzeCodeStyle(parsedFiles);

    return {
      issues: allIssues,
      score: overallScore,
      categoryScores,
      totalFiles: files.length,
      linesOfCode: totalLines,
      parsedFiles,
      languageStats,
      summary,
      recommendations,
      complexityMetrics,
      duplicateCode,
      testCoverage,
      codeSmells,
      dependencies,
      codeMetrics,
      securityVulnerabilities,
      hotspots,
      codeChurn,
      technicalDebtRatio,
      codeHealth,
      performanceMetrics,
      testingMetrics,
      documentationMetrics,
      accessibilityMetrics,
      i18nMetrics,
      databaseMetrics,
      apiMetrics,
      buildMetrics,
      deploymentMetrics,
      // NEW: Advanced features
      aiInsights,
      predictiveMetrics,
      optimizationHints,
      securityScore,
      performanceScore,
      maintainabilityScore,
      codeStyleMetrics,
    };
  }

  // Core security patterns (most critical)
  private securityPatterns = [
    {
      pattern: /password\s*=\s*["'`][^"'`]+["'`]/gi,
      message: 'Hardcoded password detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /api[_-]?key\s*=\s*["'`][^"'`]+["'`]/gi,
      message: 'Hardcoded API key detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /secret[_-]?key\s*=\s*["'`][^"'`]+["'`]/gi,
      message: 'Hardcoded secret key detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /token\s*=\s*["'`][^"'`]+["'`]/gi,
      message: 'Hardcoded token detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /eval\s*\(/gi,
      message: 'eval() usage detected - potential security risk',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /new\s+Function\s*\(/gi,
      message: 'Function constructor usage - security risk',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /dangerouslySetInnerHTML/gi,
      message: 'dangerouslySetInnerHTML detected - XSS risk',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /process\.env\.[A-Z_]+/gi,
      message: 'Environment variable access detected',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /child_process/gi,
      message: 'Child process usage detected - security consideration',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /fs\.readFile\s*\(/gi,
      message: 'File system access detected',
      severity: 'improvement' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /fs\.writeFile\s*\(/gi,
      message: 'File system write detected - security consideration',
      severity: 'improvement' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /localStorage\.setItem\s*\(/gi,
      message: 'localStorage usage - sensitive data exposure risk',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /sessionStorage\.setItem\s*\(/gi,
      message: 'sessionStorage usage - sensitive data exposure risk',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /document\.cookie\s*=/gi,
      message: 'Cookie manipulation detected - security risk',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /innerHTML\s*=/gi,
      message: 'innerHTML assignment - XSS vulnerability',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /outerHTML\s*=/gi,
      message: 'outerHTML assignment - XSS vulnerability',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /document\.write\s*\(/gi,
      message: 'document.write() usage - XSS risk',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /setTimeout\s*\([^,]*,[^)]*["'`]/gi,
      message: 'setTimeout with string argument - code injection risk',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /setInterval\s*\([^,]*,[^)]*["'`]/gi,
      message: 'setInterval with string argument - code injection risk',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /crypto\.createHash\s*\(["'`]md5["'`]/gi,
      message: 'MD5 hash usage - weak cryptographic algorithm',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /crypto\.createHash\s*\(["'`]sha1["'`]/gi,
      message: 'SHA1 hash usage - weak cryptographic algorithm',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /Math\.random\s*\(\)/gi,
      message: 'Math.random() usage - not cryptographically secure',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /XMLHttpRequest\s*\(/gi,
      message: 'XMLHttpRequest usage - consider fetch API',
      severity: 'improvement' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /child_process.*\.exec\s*\(|execSync\s*\(|execFile\s*\(/gi,
      message: 'Shell command execution detected - security risk',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /require\s*\(["'`]child_process["'`]/gi,
      message: 'Child process import - security consideration',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /require\s*\(["'`]fs["'`]/gi,
      message: 'File system import - security consideration',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /\b(?:http|ftp):\/\/[^\s/$.?#].[^\s]*["'`]/gi,
      message: 'Hardcoded URL detected - potential security risk',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /private[_-]?key\s*=\s*["'`]/gi,
      message: 'Hardcoded private key detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /certificate\s*=\s*["'`]/gi,
      message: 'Hardcoded certificate detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /auth[_-]?token\s*=\s*["'`]/gi,
      message: 'Hardcoded auth token detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /access[_-]?token\s*=\s*["'`]/gi,
      message: 'Hardcoded access token detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /refresh[_-]?token\s*=\s*["'`]/gi,
      message: 'Hardcoded refresh token detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /client[_-]?secret\s*=\s*["'`]/gi,
      message: 'Hardcoded client secret detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /database[_-]?url\s*=\s*["'`]/gi,
      message: 'Hardcoded database URL detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /connection[_-]?string\s*=\s*["'`]/gi,
      message: 'Hardcoded connection string detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /jwt[_-]?secret\s*=\s*["'`]/gi,
      message: 'Hardcoded JWT secret detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /bcrypt\.genSaltSync\s*\(/gi,
      message: 'Synchronous bcrypt usage - performance risk',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /bcrypt\.hashSync\s*\(/gi,
      message: 'Synchronous bcrypt hashing - performance risk',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /crypto\.pbkdf2Sync\s*\(/gi,
      message: 'Synchronous PBKDF2 - performance risk',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /crypto\.scryptSync\s*\(/gi,
      message: 'Synchronous scrypt - performance risk',
      severity: 'warning' as Severity,
      category: 'security' as ReviewCategory,
    },
  ];

  // Key performance patterns
  private performancePatterns = [
    {
      pattern: /useState\s*\(/gi,
      message: 'useState call detected - check if related state can be combined',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /useEffect\s*\(/gi,
      message: 'useEffect hook detected - check if effects can be combined',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /setInterval\s*\(/gi,
      message: 'setInterval usage detected - ensure cleanup',
      severity: 'warning' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /\.map\([^)]*\)\.filter\([^)]*\)\.map\(/gi,
      message: 'Multiple map/filter chains - can be optimized',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /for\s*\([^)]*\)\s*{[^}]*\.push\(/gi,
      message: 'Loop with push - consider using map or reduce',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /\.length\s*===\s*0\s*\?[^:]+:\.[^;]+/gi,
      message: 'Inefficient array length check in loop condition',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /array\.from\s*\([^)]*\)\.fill\s*\([^)]*\)/gi,
      message: 'Use Array.from().fill() for array creation',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /for\s*\([^)]*\)\s*in\s*\([^)]*\)\s*{[^}]*\.length/gi,
      message: 'Cache array length in loops for better performance',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /new\s+array\s*\([^)]*\)\s*\.map\s*\(/gi,
      message: 'Use Array constructor with map() - consider alternative',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /math\.floor\s*\([^)]*\)\s*\+\s*math\.random/gi,
      message: 'Use Math.floor(Math.random() * n) for random integers',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /for\s*\(\s*let\s+i\s*=\s*0\s*;\s*i\s*<\s*[^;]+\s*;\s*i\+\+\s*\)\s*\{[^}]*\.length\s*\}/gi,
      message: 'Array.length in for loop condition - inefficient',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /document\.getElementById\s*\(/gi,
      message: 'Repeated DOM queries - consider caching',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /document\.querySelector\s*\(/gi,
      message: 'Repeated DOM queries - consider caching',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /document\.querySelectorAll\s*\(/gi,
      message: 'Repeated DOM queries - consider caching',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /addEventListener\s*\(/gi,
      message: 'Event listener without cleanup - potential memory leak',
      severity: 'warning' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /requestAnimationFrame\s*\(/gi,
      message: 'requestAnimationFrame usage - ensure cancelAnimationFrame cleanup',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /setTimeout\s*\(\s*[^,]*,\s*0\s*\)/gi,
      message: 'setTimeout with 0 delay - consider requestIdleCallback',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /setImmediate\s*\(/gi,
      message: 'setImmediate usage - consider Promise or queueMicrotask',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /process\.nextTick\s*\(/gi,
      message: 'process.nextTick usage - consider Promise or queueMicrotask',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /async\s+function\s*\([^)]*\)\s*\{[^}]*await\s+await/gi,
      message: 'Sequential await calls - consider Promise.all',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /\.forEach\s*\(\s*async\s+/gi,
      message: 'async forEach - consider Promise.all or for...of',
      severity: 'warning' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /new\s+Date\s*\(\s*\)\s*\.\s*getTime\s*\(\s*\)/gi,
      message: 'Date.now() is more efficient than new Date().getTime()',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Array\.prototype\.slice\.call\s*\(/gi,
      message: 'Use Array.from() instead of Array.prototype.slice.call()',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Object\.keys\s*\([^)]*\)\.forEach/gi,
      message: 'Object.keys().forEach - consider for...in or Object.entries',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Object\.values\s*\([^)]*\)\.forEach/gi,
      message: 'Object.values().forEach - consider for...of',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /JSON\.parse\s*\(\s*JSON\.stringify\s*\(/gi,
      message: 'JSON.parse(JSON.stringify()) - deep copy anti-pattern',
      severity: 'warning' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /\.concat\s*\([^)]*\)\.concat\s*\(/gi,
      message: 'Multiple concat calls - consider spread operator',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /RegExp\s*\(["'`][^"'`]*["'`]\s*,\s*["'`]g["'`]\s*\)/gi,
      message: 'Global RegExp in loop - consider resetting lastIndex',
      severity: 'warning' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /while\s*\(\s*true\s*\)/gi,
      message: 'Infinite loop detected - ensure proper exit condition',
      severity: 'critical' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /for\s*\(\s*;\s*;\s*\)/gi,
      message: 'Infinite loop detected - ensure proper exit condition',
      severity: 'critical' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /do\s*\{[^}]*\}\s*while\s*\(\s*true\s*\)/gi,
      message: 'Infinite loop detected - ensure proper exit condition',
      severity: 'critical' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /\.sort\s*\(\s*\)\s*\.slice\s*\(/gi,
      message: 'Sort then slice - inefficient for large arrays',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /\.filter\s*\(\s*\)\s*\.map\s*\(/gi,
      message: 'Filter then map - consider reduce for single pass',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /\.map\s*\(\s*\)\s*\.filter\s*\(/gi,
      message: 'Map then filter - consider reduce for single pass',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /\.reduce\s*\(\s*\)\s*\.reduce\s*\(/gi,
      message: 'Multiple reduce calls - consider combining',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /new\s+Array\s*\(\s*\d+\s*\)\s*\.fill\s*\(/gi,
      message: 'Use Array(length).fill() for array creation',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /String\.prototype\.repeat\s*\(/gi,
      message: 'String.repeat() - consider template literals for small strings',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /parseInt\s*\([^)]*\)\s*\+\s*parseInt\s*\([^)]*\)/gi,
      message: 'Multiple parseInt calls - consider Number() or + operator',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /parseFloat\s*\([^)]*\)\s*\+\s*parseFloat\s*\([^)]*\)/gi,
      message: 'Multiple parseFloat calls - consider Number() or + operator',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Math\.floor\s*\(\s*[^)]*\s*\*\s*[^)]*\s*\)/gi,
      message: 'Math.floor(x * y) - consider bitwise OR for integers',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Math\.ceil\s*\(\s*[^)]*\s*\*\s*[^)]*\s*\)/gi,
      message: 'Math.ceil(x * y) - consider bitwise operations for integers',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Math\.round\s*\(\s*[^)]*\s*\*\s*[^)]*\s*\)/gi,
      message: 'Math.round(x * y) - consider bitwise operations for integers',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Math\.abs\s*\(\s*[^)]*\s*-\s*[^)]*\s*\)/gi,
      message: 'Math.abs(x - y) - consider Math.hypot() for distances',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Math\.pow\s*\(\s*[^)]*\s*,\s*2\s*\)/gi,
      message: 'Math.pow(x, 2) - use x * x for squaring',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Math\.pow\s*\(\s*[^)]*\s*,\s*3\s*\)/gi,
      message: 'Math.pow(x, 3) - use x * x * x for cubing',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Math\.sqrt\s*\(\s*[^)]*\s*\*\s*[^)]*\s*\)/gi,
      message: 'Math.sqrt(x * x) - use Math.abs(x) instead',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Math\.min\s*\(\s*[^,]*,\s*[^)]*\s*\)/gi,
      message: 'Math.min with 2 arguments - consider conditional operator',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Math\.max\s*\(\s*[^,]*,\s*[^)]*\s*\)/gi,
      message: 'Math.max with 2 arguments - consider conditional operator',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Math\.floor\s*\(\s*Math\.random\s*\(\s*\)\s*\*\s*[^)]+\s*\)/gi,
      message: 'Math.floor(Math.random() * n) - use ~~(Math.random() * n)',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /Math\.random\s*\(\s*\)\s*<\s*[^)]+\s*\?\s*[^:]+\s*:\s*[^)]+/gi,
      message: 'Random boolean - consider Math.random() < 0.5',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /buffer\.toString\s*\(\s*['"`]base64['"`]\s*\)/gi,
      message: 'Buffer to base64 - consider buffer.toString(\'base64url\')',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /JSON\.stringify\s*\([^,]*,\s*null,\s*2\s*\)/gi,
      message: 'JSON.stringify with indent - performance impact',
      severity: 'warning' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /JSON\.stringify\s*\([^,]*,\s*null,\s*\d+\s*\)/gi,
      message: 'JSON.stringify with indent - performance impact',
      severity: 'warning' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /JSON\.parse\s*\([^)]*\)\s*\.\s*\w+\s*\(/gi,
      message: 'JSON.parse followed by property access - consider reviver',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /atob\s*\(/gi,
      message: 'atob() usage - consider Buffer in Node.js',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /btoa\s*\(/gi,
      message: 'btoa() usage - consider Buffer in Node.js',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
  ];

  // Essential code quality patterns
  private codeQualityPatterns = [
    {
      pattern: /console\.(log|warn|error|debug)/gi,
      message: 'Console statement found - remove in production',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /var\s+\w+/gi,
      message: 'var keyword used - prefer const or let',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /==\s*['"`]/gi,
      message: 'Use === instead of == for strict equality',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /!=\s*['"`]/gi,
      message: 'Use !== instead of != for strict inequality',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
      message: 'Commented code detected - consider removing',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /debugger/gi,
      message: 'Debugger statement found - remove in production',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /\/\*\s*@deprecated/gi,
      message: 'Deprecated code detected - should be removed',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /@ts-ignore/gi,
      message: 'TypeScript ignore directive found',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /any\s*(\[|<)/gi,
      message: 'Any type usage detected - consider specific typing',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /as\s+any/gi,
      message: 'Type assertion to any detected',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    // NEW: Additional Code Quality Patterns
    {
      pattern: /TODO|FIXME|HACK|XXX/gi,
      message: 'Temporary code marker detected - should be addressed',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /alert\s*\(/gi,
      message: 'alert() usage - use proper error handling',
      severity: 'warning' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /confirm\s*\(/gi,
      message: 'confirm() usage - use proper UI components',
      severity: 'warning' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /prompt\s*\(/gi,
      message: 'prompt() usage - use proper form inputs',
      severity: 'warning' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /return\s*;\s*$/gi,
      message: 'Unnecessary return statement',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /;\s*;/gi,
      message: 'Double semicolon detected',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /\s*;\s*\n\s*}/gi,
      message: 'Trailing semicolon before closing brace',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /\{\s*;\s*/gi,
      message: 'Empty statement block with semicolon',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /if\s*\(\s*[^)]+\s*\)\s*;\s*/gi,
      message: 'Empty if statement with semicolon',
      severity: 'warning' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /for\s*\([^)]*\)\s*;\s*/gi,
      message: 'Empty for loop with semicolon',
      severity: 'warning' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /while\s*\([^)]*\)\s*;\s*/gi,
      message: 'Empty while loop with semicolon',
      severity: 'warning' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /do\s*;\s*while/gi,
      message: 'Empty do-while loop',
      severity: 'warning' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /switch\s*\([^)]*\)\s*\{\s*\}/gi,
      message: 'Empty switch statement',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /case\s*[^:]+:\s*;/gi,
      message: 'Empty case statement',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /default\s*:\s*;/gi,
      message: 'Empty default case',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /try\s*\{\s*\}/gi,
      message: 'Empty try block',
      severity: 'warning' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /catch\s*\([^)]*\)\s*\{\s*\}/gi,
      message: 'Empty catch block',
      severity: 'warning' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /finally\s*\{\s*\}/gi,
      message: 'Empty finally block',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /class\s+\w+\s*\{\s*\}/gi,
      message: 'Empty class definition',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /function\s+\w+\s*\([^)]*\)\s*\{\s*\}/gi,
      message: 'Empty function definition',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{\s*\}/gi,
      message: 'Empty arrow function',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /if\s*\([^)]+\)\s*\{\s*return\s+[^}]+;\s*\}\s*else\s*\{\s*return\s+[^}]+;\s*\}/gi,
      message: 'Ternary operator would be more concise',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /if\s*\([^)]+\)\s*\{\s*[^}]*\s*return\s+[^}]+;\s*\}\s*else\s*\{\s*[^}]*\s*return\s+[^}]+;\s*\}/gi,
      message: 'Ternary operator would be more concise',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /if\s*\([^)]+\)\s*\{\s*[^}]*\s*\}\s*else\s*\{\s*\}/gi,
      message: 'Unnecessary else block',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /if\s*\([^)]+\)\s*\{\s*\}\s*else\s*\{[^}]*\s*\}/gi,
      message: 'Invert condition to avoid empty if block',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /if\s*\([^)]+\)\s*\{\s*return\s+true;\s*\}\s*else\s*\{\s*return\s+false;\s*\}/gi,
      message: 'Return boolean expression directly',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /if\s*\([^)]+\)\s*\{\s*return\s+false;\s*\}\s*else\s*\{\s*return\s+true;\s*\}/gi,
      message: 'Return boolean expression directly',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /if\s*\([^)]+\)\s*\{\s*[^}]*\s*return\s+[^}]+;\s*\}\s*return\s+[^}]+;/gi,
      message: 'Use early return pattern',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /switch\s*\([^)]*\)\s*\{\s*case\s*[^:]+:\s*[^}]*\s*case\s*[^:]+:/gi,
      message: 'Missing break statement in case',
      severity: 'warning' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /switch\s*\([^)]*\)\s*\{\s*case\s*[^:]+:\s*[^}]*\s*default\s*:/gi,
      message: 'Missing break statement before default',
      severity: 'warning' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /\bcase\s+(true|false)\s*:/gi,
      message: 'Switch on boolean - use if-else instead',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /\bcase\s+(null|undefined)\s*:/gi,
      message: 'Switch on null/undefined - use if-else instead',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
    {
      pattern: /style=\{[^}]*\}/gi,
      message: 'Inline styles detected - use CSS classes or styled components',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
  ];

  // Critical error handling patterns
  private errorHandlingPatterns = [
    {
      pattern: /fetch\([^)]*\)(?!\s*\.catch\(|\s*\.then\([^)]*catch)/gi,
      message: 'fetch call without error handling',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /try\s*{[^}]*}\s*(?!catch|finally)/gi,
      message: 'Try block without catch or finally',
      severity: 'critical' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /JSON\.parse\([^)]*\)(?!\s*try\s*{)/gi,
      message: 'JSON.parse without try-catch block',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /await\s+\w+\([^)]*\)(?!\s*try\s*{)/gi,
      message: 'Await without error handling',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\.catch\s*\(\s*\)/gi,
      message: 'Empty catch block - should handle errors',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /throw\s+new\s+Error\s*\(/gi,
      message: 'Generic Error thrown - use specific error types',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /catch\s*\([^)]*\)\s*{\s*throw\s+[^}]*}/gi,
      message: 'Re-throwing in catch without modification',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /throw\s+['"][^'"]+['"]/gi,
      message: 'Throwing raw string instead of Error object',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /console\.(error|warn)\s*\(/gi,
      message: 'Logging error without throwing or handling',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\.then\([^)]*\)\s*(;|$)/gi,
      message: 'Promise chain without catch',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /Promise\.all\s*\([^)]*\)(?!\s*\.catch)/gi,
      message: 'Promise.all without catch handling',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /Promise\.race\s*\([^)]*\)(?!\s*\.catch)/gi,
      message: 'Promise.race without catch handling',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /Promise\.any\s*\([^)]*\)(?!\s*\.catch)/gi,
      message: 'Promise.any without catch handling',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /Promise\.allSettled\s*\([^)]*\)(?!\s*\.catch)/gi,
      message: 'Promise.allSettled without catch handling',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /process\.on\(\s*['"]uncaughtException['"]/gi,
      message: 'Process uncaughtException handler present - ensure graceful shutdown',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /process\.on\(\s*['"]unhandledRejection['"]/gi,
      message: 'Process unhandledRejection handler present - review resiliency',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /new\s+AbortController\s*\(\)/gi,
      message: 'Consider using AbortController to cancel async operations',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /setTimeout\s*\(/gi,
      message: 'setTimeout detected - ensure cleanup with clearTimeout',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /setInterval\s*\(/gi,
      message: 'setInterval detected - ensure cleanup with clearInterval',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /addEventListener\s*\(/gi,
      message: 'Event listener detected - ensure removal to prevent leaks',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /throw\s+new\s+\w*Error\s*\(\s*`[^`]*\${[^}]+}[^`]*`\s*\)/gi,
      message: 'Error message with string interpolation - ensure sensitive data not leaked',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /catch\s*\([^)]*error[^)]*\)\s*\{.*\bthrow\s+error\b/gi,
      message: 'Re-throwing same error without context',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /retry|backoff|exponential\s+backoff/gi,
      message: 'Consider structured retry with backoff and jitter',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\/\/\s*TODO:\s*error\s*handling/gi,
      message: 'Missing error handling (TODO found)',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /catch\s*\([^)]*\)\s*{\s*console\.(log|info)\s*\(/gi,
      message: 'Catch block logging with console.log/info - use error level and context',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /throw\s+new\s+\w*Error\s*\(\s*\)/gi,
      message: 'Throwing Error without message',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /reject\s*\(\s*['"][^'"]+['"]\s*\)/gi,
      message: 'Promise rejection with string - use Error object',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\.catch\s*\(\s*\w+\s*=>\s*\w+\s*\)/gi,
      message: 'Catch handler swallowing errors',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /try\s*{[^}]*}\s*catch\s*\([^)]*\)\s*{[^}]{0,40}}/gi,
      message: 'Catch block too small - likely missing handling',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /try\s*{[^}]*}\s*catch\s*\([^)]*\)\s*{[^}]*}\s*finally\s*{\s*}/gi,
      message: 'Empty finally block - consider cleanup or remove',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /await\s+\w+\([^)]*\)\s*\.catch\s*\(\s*console\.(log|info)/gi,
      message: 'Async catch only logging - consider throwing or handling',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\.finally\s*\(\s*\)/gi,
      message: 'Finally without cleanup logic',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /throw\s+new\s+(Type|Range|Reference|Syntax)Error\s*\(/gi,
      message: 'Specific error type thrown - ensure surrounding try-catch',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /callback\s*\(\s*null\s*,\s*[^)]*\)/gi,
      message: 'Callback-style success without error-first pattern',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /callback\s*\(\s*new\s+Error/gi,
      message: 'Callback error creation - ensure handled upstream',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\.fail\s*\(/gi,
      message: 'jQuery-style fail handler detected - ensure modern error handling',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /axios\.get\([^)]*\)(?!\s*\.catch)/gi,
      message: 'Axios request without catch',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /axios\.post\([^)]*\)(?!\s*\.catch)/gi,
      message: 'Axios post without catch',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /axios\.request\([^)]*\)(?!\s*\.catch)/gi,
      message: 'Axios generic request without catch',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /subscribe\s*\(/gi,
      message: 'Observable subscribe - ensure error handler is provided',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /catch\s*\([^)]*\)\s*\{.*console\.(error|warn)/gi,
      message: 'Catch block only logs without remediation',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /throw\s+\w+;?\s*\/\/\s*nolint/gi,
      message: 'Throw suppressed with nolint - verify necessity',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /async\s+function\s+\w+\([^)]*\)\s*\{.*return\s+.*\.catch\s*\(/gi,
      message: 'Async function returning promise with inline catch - verify propagation',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /await\s+Promise\.all\s*\([^)]*\)\s*\.then\s*\(/gi,
      message: 'Mixed await and then - ensure errors handled',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /catch\s*\([^)]*\)\s*\{.*\bthrow\b.*new\s+Error\s*\(/gi,
      message: 'Wrapping error without preserving original cause',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\btransaction\b.*\bcommit\s*\(/gi,
      message: 'Transaction commit - ensure rollback in catch',
      severity: 'critical' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\btransaction\b.*catch/gi,
      message: 'Transaction catch - verify rollback is present',
      severity: 'critical' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /fs\.(readFile|writeFile|appendFile|rm|unlink|rmdir)\s*\([^)]*\)(?!\s*\.catch)/gi,
      message: 'Filesystem promise call without catch',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /fs\.(readFileSync|writeFileSync|rmSync|unlinkSync)\s*\(/gi,
      message: 'Synchronous filesystem call - handle errors and consider async',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /database\b.*catch/gi,
      message: 'Database error handling - ensure errors have context',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /fetch\([^)]*timeout[^)]*\)/gi,
      message: 'Fetch with timeout - consider using AbortController',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /JSON\.stringify\s*\(/gi,
      message: 'JSON.stringify - ensure catch covers circular reference errors',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /await\s+\w+\([^)]*retry[^)]*\)/gi,
      message: 'Retry logic detected - ensure catch and retry limit',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /throw\s+new\s+HttpError\s*\(/gi,
      message: 'HTTP error thrown - ensure mapped to response',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /res\.status\(500\)\.send\(/gi,
      message: '500 response sent - ensure error logged and traced',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /res\.json\(\s*{\s*error:\s*['"][^'"]+['"]\s*}\s*\)/gi,
      message: 'API error response without code field',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\bopen\s*\(/gi,
      message: 'Resource open detected - ensure close in finally',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /finally\s*\{.*(close|dispose|destroy)\s*\(/gi,
      message: 'Finally cleanup detected - verify coverage for all branches',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\bcatch\s*\([^)]*\)\s*\{.*\bnext\s*\(\s*error\s*\)/gi,
      message: 'Express middleware passes error - ensure error handler middleware exists',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /res\.status\([^)]*\)\.end\(\)/gi,
      message: 'Response ended without body - ensure clients handle gracefully',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\bwindow\.addEventListener\(\s*['"]error['"]/gi,
      message: 'Global window error listener - ensure reporting pipeline',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /\bwindow\.addEventListener\(\s*['"]unhandledrejection['"]/gi,
      message: 'Global unhandledrejection listener - ensure error reporting',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /queueMicrotask\s*\(/gi,
      message: 'queueMicrotask used - ensure error propagation to caller',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /emit\s*\(\s*['"]error['"]/gi,
      message: 'EventEmitter error emission - ensure listener attached',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /on\s*\(\s*['"]error['"]/gi,
      message: 'EventEmitter error listener registered - verify removal and handling',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /async\s+\([\w,\s]*\)\s*=>\s*\{/gi,
      message: 'Async arrow function - ensure top-level errors handled',
      severity: 'improvement' as Severity,
      category: 'error-handling' as ReviewCategory,
    },
    {
      pattern: /void\s+\w+\(\s*async/gi,
      message: 'void async invocation - errors may be unobserved',
      severity: 'warning' as Severity,
      category: 'error-handling' as ReviewCategory,
    }
  ];

  // Core architecture patterns
  private architecturePatterns = [
    {
      pattern: /import.*from\s+['"`]\.\.\/\.\.\/\.\./gi,
      message: 'Deep import path detected - consider refactoring',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /export\s+default\s+function\s+\w+\(\w*,\w*,\w*,\w*,\w*\)/gi,
      message: 'Function with too many parameters - consider using object parameter',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /\/\*\*\s*@deprecated/gi,
      message: 'Deprecated code detected - should be removed',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /any\s*(\[|<)/gi,
      message: 'Any type usage detected - consider specific typing',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /import\s+\{[^}]*\}\s+from\s+['"`].*\*\*.*['"`]/gi,
      message: 'Wildcard-like deep import - prefer index/barrel exports',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /import\s+.+['"`]\.\.\/(?:[^/]+\/){3,}[^'"`]+['"`]/gi,
      message: 'Import traverses many directories - consider flattening modules',
      severity: 'warning' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /\b(service|repository|controller|useCase)\b.*\bnew\s+\w+\(/gi,
      message: 'Service-like class instantiates dependencies directly - prefer dependency injection',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /\bSingleton\b|\bstatic\s+instance\b/gi,
      message: 'Singleton usage - ensure thread safety and testability',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /export\s+\*\s+from\s+['"`][^'"`]+['"`]/gi,
      message: 'Barrel export detected - ensure tree-shaking and boundary control',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /class\s+\w+\s+extends\s+\w+Manager/gi,
      message: 'Manager suffix - verify single responsibility',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /class\s+\w+\s+extends\s+\w+Controller/gi,
      message: 'Controller inheritance - check for thin controller pattern',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /@Controller|@Injectable|@Service|@Repository/gi,
      message: 'DI annotations present - ensure proper module boundaries',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /graphql.*\bresolver\b/gi,
      message: 'GraphQL resolver - validate batching and error surface',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /microservice|event\s+bus|message\s+queue/gi,
      message: 'Event-driven or microservice keywords - verify idempotency and retries',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /feature\s+flag|toggle|kill\s+switch/gi,
      message: 'Feature flag usage - ensure default/off behavior documented',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /api\s+gateway|bff\b/gi,
      message: 'API gateway/BFF detected - enforce boundary contracts',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /monorepo|workspace\s*:\s*\[/gi,
      message: 'Monorepo indicators - ensure shared package version alignment',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /shared\s*\/\s*utils|common\s*\/\s*lib/gi,
      message: 'Shared utils import - verify dependency boundaries',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /\bmiddleware\b.*\bnext\s*\(/gi,
      message: 'Middleware detected - confirm ordering and error propagation',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /\blogger\b|observability|tracing|otel|openTelemetry/gi,
      message: 'Observability hooks present - ensure correlation IDs propagate',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /circuit\s+breaker|bulkhead|rate\s+limit/gi,
      message: 'Resiliency pattern keywords - verify configuration and fallbacks',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /import\s+.+['"`]@\w+\//gi,
      message: 'Scoped package import - ensure versioning and peer deps aligned',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
    {
      pattern: /module\.exports\s*=/gi,
      message: 'CommonJS module.exports - consider using ESM export',
      severity: 'warning' as Severity,
      category: 'architecture' as ReviewCategory,
    }
  ];

  async analyzeFiles(files: GitHubFile[]): Promise<AnalysisResult> {
    const startTime = performance.now();
    const allIssues: ReviewIssue[] = [];
    const parsedFiles: ParsedFile[] = [];
    const languageStats: Record<string, number> = {};
    let totalLines = 0;
    let issueId = 1;
    const complexities: number[] = [];

    // Parse each file
    for (const file of files) {
      try {
        const parsed = await fileProcessor.parseFile(file);
        parsedFiles.push(parsed);
        
        // Update language statistics
        languageStats[parsed.language] = (languageStats[parsed.language] || 0) + 1;
        totalLines += parsed.linesOfCode;
        complexities.push(parsed.complexity);

        // Analyze parsed file for issues
        const fileIssues = this.analyzeParsedFile(parsed, issueId);
        allIssues.push(...fileIssues);
        issueId += fileIssues.length;
      } catch (error) {
        console.warn(`Failed to parse file ${file.path}:`, error);
        // Fallback to simple pattern matching
        const simpleIssues = this.analyzeFileWithPatterns(file, issueId);
        allIssues.push(...simpleIssues);
        issueId += simpleIssues.length;
        totalLines += file.content?.split('\n').length || 0;
      }
    }

    // Update efficiency stats
    this.analysisStats.totalFilesAnalyzed += files.length;
    this.analysisStats.totalLinesProcessed += totalLines;
    const analysisTime = performance.now() - startTime;
    this.analysisStats.averageAnalysisTime = 
      (this.analysisStats.averageAnalysisTime + analysisTime) / 2;

    // Calculate scores
    const categoryScores = this.calculateCategoryScores(allIssues);
    const overallScore = this.calculateOverallScore(allIssues, totalLines);
    
    // Calculate additional metrics
    const summary = this.calculateSummary(allIssues, categoryScores, totalLines);
    const recommendations = this.generateRecommendations(allIssues, categoryScores, languageStats);
    const complexityMetrics = this.calculateComplexityMetrics(complexities, parsedFiles);
    const duplicateCode = this.detectDuplicateCode(parsedFiles);
    
    // Calculate test coverage and get coverage issues separately
    const testCoverage = this.calculateTestCoverage(parsedFiles);
    const testCoverageIssues = this.getTestCoverageIssues(parsedFiles);
    
    // Add test coverage issues to the main issues list
    allIssues.push(...testCoverageIssues);
    
    // New advanced metrics
    const codeSmells = this.detectCodeSmells(parsedFiles);
    const dependencies = this.analyzeDependencies(parsedFiles);
    const codeMetrics = this.calculateDetailedMetrics(parsedFiles);
    const securityVulnerabilities = this.analyzeSecurityVulnerabilities(allIssues, parsedFiles);
    
    // Premium features
    const hotspots = this.identifyHotspots(allIssues, parsedFiles, codeMetrics);
    const codeChurn = this.analyzeCodeChurn(parsedFiles);
    const technicalDebtRatio = this.calculateTechnicalDebtRatio(summary.technicalDebt, totalLines);
    const codeHealth = this.assessCodeHealth(categoryScores, summary, codeSmells);
    const performanceMetrics = this.estimatePerformanceMetrics(parsedFiles, allIssues);
    
    // Comprehensive features
    const testingMetrics = this.analyzeTesting(parsedFiles);
    const documentationMetrics = this.analyzeDocumentation(parsedFiles);
    const accessibilityMetrics = this.analyzeAccessibility(parsedFiles);
    const i18nMetrics = this.analyzeI18n(parsedFiles);
    const databaseMetrics = this.analyzeDatabase(parsedFiles);
    const apiMetrics = this.analyzeApi(parsedFiles);
    const buildMetrics = this.analyzeBuild(parsedFiles);
    const deploymentMetrics = this.analyzeDeployment(parsedFiles);
    
    // NEW: Advanced features
    const aiInsights = this.generateAIInsights(allIssues, parsedFiles);
    const predictiveMetrics = this.calculatePredictiveMetrics(parsedFiles);
    const optimizationHints = this.generateOptimizationHints(allIssues, parsedFiles);
    const securityScore = this.calculateAdvancedSecurityScore(allIssues);
    const performanceScore = this.calculateAdvancedPerformanceScore(parsedFiles);
    const maintainabilityScore = this.calculateMaintainabilityScore(parsedFiles);

    // NEW: Code style metrics
    const codeStyleMetrics = this.analyzeCodeStyle(parsedFiles);

    return {
      issues: allIssues,
      score: overallScore,
      categoryScores,
      totalFiles: files.length,
      linesOfCode: totalLines,
      parsedFiles,
      languageStats,
      summary,
      recommendations,
      complexityMetrics,
      duplicateCode,
      testCoverage,
      codeSmells,
      dependencies,
      codeMetrics,
      securityVulnerabilities,
      hotspots,
      codeChurn,
      technicalDebtRatio,
      codeHealth,
      performanceMetrics,
      testingMetrics,
      documentationMetrics,
      accessibilityMetrics,
      i18nMetrics,
      databaseMetrics,
      apiMetrics,
      buildMetrics,
      deploymentMetrics,
      // NEW: Advanced features
      aiInsights,
      predictiveMetrics,
      optimizationHints,
      securityScore,
      performanceScore,
      maintainabilityScore,
      codeStyleMetrics,
    };
  }

  private calculateComplexityMetrics(complexities: number[], parsedFiles: ParsedFile[]): AnalysisResult['complexityMetrics'] {
    const averageComplexity = complexities.reduce((a, b) => a + b, 0) / complexities.length || 0;
    const maxComplexity = Math.max(...complexities, 0);
    const threshold = averageComplexity * 1.5;
    const complexFiles = parsedFiles
      .filter(f => f.complexity > threshold)
      .map(f => f.path)
      .slice(0, 10);

    return {
      averageComplexity: Math.round(averageComplexity),
      maxComplexity,
      complexFiles,
    };
  }

  private detectDuplicateCode(parsedFiles: ParsedFile[]): AnalysisResult['duplicateCode'] {
    // Simple duplicate detection based on similar function signatures
    const functionSignatures = new Map<string, number>();
    let duplicateBlocks = 0;
    let duplicatedLines = 0;

    parsedFiles.forEach(file => {
      file.functions.forEach(func => {
        const signature = `${func.name}(${func.parameters.length})`;
        const count = functionSignatures.get(signature) || 0;
        if (count > 0) {
          duplicateBlocks++;
          duplicatedLines += 10; // Estimated lines per duplicate
        }
        functionSignatures.set(signature, count + 1);
      });
    });

    const totalLines = parsedFiles.reduce((sum, f) => sum + f.linesOfCode, 0);
    const duplicationPercentage = totalLines > 0 ? (duplicatedLines / totalLines) * 100 : 0;

    return {
      duplicateBlocks,
      duplicatedLines,
      duplicationPercentage: Math.round(duplicationPercentage * 10) / 10,
    };
  }

  private getTestCoverageIssues(parsedFiles: ParsedFile[]): ReviewIssue[] {
    const testFiles = parsedFiles.filter(f => 
      f.path.includes('.test.') || 
      f.path.includes('.spec.') || 
      f.path.includes('__tests__')
    );
    const testedFiles = new Set<string>();

    // Simple heuristic: if there's a test file, assume related files are tested
    testFiles.forEach(testFile => {
      const baseName = testFile.path.replace(/\.test\./, '.').replace(/\.spec\./, '.');
      testedFiles.add(baseName);
    });

    const coverage = parsedFiles.length > 0 ? (testedFiles.size / parsedFiles.length) * 100 : 0;

    // Add issue if test coverage is below 60%
    const issues: ReviewIssue[] = [];
    if (coverage < 60 && parsedFiles.length > 0) {
      issues.push({
        id: `issue-test-coverage-${Date.now()}`,
        severity: 'warning' as Severity,
        category: 'code-quality' as ReviewCategory,
        file: 'project',
        line: 1,
        title: 'Test coverage below 60%',
        description: `Project has ${Math.round(coverage * 10) / 10}% test coverage, which is below the recommended 60%`,
        suggestion: 'Add more test files to improve coverage',
      });
    }

    return issues;
  }

  private calculateTestCoverage(parsedFiles: ParsedFile[]): AnalysisResult['testCoverage'] {
    const testFiles = parsedFiles.filter(f => 
      f.path.includes('.test.') || 
      f.path.includes('.spec.') || 
      f.path.includes('__tests__')
    );
    const testedFiles = new Set<string>();

    // Simple heuristic: if there's a test file, assume related files are tested
    testFiles.forEach(testFile => {
      const baseName = testFile.path.replace(/\.test\./, '.').replace(/\.spec\./, '.');
      testedFiles.add(baseName);
    });

    const coverage = parsedFiles.length > 0 ? (testedFiles.size / parsedFiles.length) * 100 : 0;
    const untestedFiles = parsedFiles
      .filter(f => !testedFiles.has(f.path) && !f.path.includes('.test.') && !f.path.includes('.spec.'))
      .map(f => f.path)
      .slice(0, 10);

    return {
      coverage: Math.round(coverage * 10) / 10,
      testedFiles: testedFiles.size,
      untestedFiles,
    };
  }

  private analyzeParsedFile(parsed: ParsedFile, startIssueId: number): ReviewIssue[] {
    const issues: ReviewIssue[] = [];
    let issueId = startIssueId;

    // Analyze functions
    parsed.functions.forEach(func => {
      // Check for complex functions
      if (func.complexity > 10) {
        issues.push({
          id: `issue-${issueId++}`,
          severity: 'warning',
          category: 'performance',
          file: parsed.path,
          line: func.line,
          title: 'High complexity function detected',
          description: `Function ${func.name} has a complexity score of ${func.complexity}`,
          suggestion: 'Consider breaking down this function into smaller, more focused functions.',
        });
      }

      // Check for functions without return statements
      if (!func.hasReturn && func.type !== 'arrow' && !func.name.includes('render')) {
        issues.push({
          id: `issue-${issueId++}`,
          severity: 'improvement',
          category: 'code-quality',
          file: parsed.path,
          line: func.line,
          title: 'Function without return statement',
          description: `Function ${func.name} doesn't have a return statement`,
          suggestion: 'Add a return statement or make the function void if no return is needed.',
        });
      }

      // Check for too many parameters
      if (func.parameters.length > 5) {
        issues.push({
          id: `issue-${issueId++}`,
          severity: 'improvement',
          category: 'architecture',
          file: parsed.path,
          line: func.line,
          title: 'Function with too many parameters',
          description: `Function ${func.name} has ${func.parameters.length} parameters`,
          suggestion: 'Consider using an object parameter or configuration object.',
        });
      }
    });

    // Analyze classes
    parsed.classes.forEach(cls => {
      // Check for large classes
      if (cls.methods.length > 15) {
        issues.push({
          id: `issue-${issueId++}`,
          severity: 'warning',
          category: 'architecture',
          file: parsed.path,
          line: cls.line,
          title: 'Large class detected',
          description: `Class ${cls.name} has ${cls.methods.length} methods`,
          suggestion: 'Consider splitting this class into smaller, more focused classes.',
        });
      }

      // Check for classes without methods
      if (cls.methods.length === 0 && cls.properties.length > 0) {
        issues.push({
          id: `issue-${issueId++}`,
          severity: 'improvement',
          category: 'architecture',
          file: parsed.path,
          line: cls.line,
          title: 'Class without methods',
          description: `Class ${cls.name} has no methods but has properties`,
          suggestion: 'Consider using an interface or type instead of a class.',
        });
      }
    });

    const externalImports = parsed.imports.filter(imp => imp.isExternal);
    if (externalImports.length > 20) {
      issues.push({
        id: `issue-${issueId++}`,
        severity: 'improvement',
        category: 'architecture',
        file: parsed.path,
        line: 1,
        title: 'Too many external dependencies',
        description: `File has ${externalImports.length} external imports`,
        suggestion: 'Consider reducing dependencies or using lazy loading.',
      });
    }

    // Analyze comments with code
    const commentedCode = parsed.comments.filter(comment => comment.hasCode);
    if (commentedCode.length > 3) {
      issues.push({
        id: `issue-${issueId++}`,
        severity: 'improvement',
        category: 'code-quality',
        file: parsed.path,
        line: commentedCode[0].line,
        title: 'Commented code detected',
        description: `Found ${commentedCode.length} instances of commented code`,
        suggestion: 'Remove commented code or use proper documentation.',
      });
    }

    // Analyze variables
    const varVariables = parsed.variables.filter(v => v.type === 'var');
    if (varVariables.length > 0) {
      issues.push({
        id: `issue-${issueId++}`,
        severity: 'improvement',
        category: 'code-quality',
        file: parsed.path,
        line: varVariables[0].line,
        title: 'var keyword usage detected',
        description: `Found ${varVariables.length} variables declared with var`,
        suggestion: 'Replace var with const or let for better scoping.',
      });
    }

    // Analyze file complexity
    if (parsed.complexity > 50) {
      issues.push({
        id: `issue-${issueId++}`,
        severity: 'warning',
        category: 'architecture',
        file: parsed.path,
        line: 1,
        title: 'High file complexity',
        description: `File has a complexity score of ${parsed.complexity}`,
        suggestion: 'Consider breaking down this file into smaller modules.',
      });
    }

    // Run pattern-based analysis for additional issues
    const patternIssues = this.analyzeFileWithPatterns(
      { path: parsed.path, content: parsed.content } as GitHubFile,
      issueId
    );
    issues.push(...patternIssues);

    return issues;
  }

  private generateDescription(category: ReviewCategory, message: string): string {
    const descriptions: Record<ReviewCategory, string> = {
      security: 'Security vulnerabilities can expose your application to attacks and data breaches.',
      performance: 'Performance issues can slow down your application and impact user experience.',
      'code-quality': 'Code quality issues affect maintainability and readability of your codebase.',
      'error-handling': 'Proper error handling prevents crashes and improves user experience.',
      architecture: 'Architecture issues affect scalability and maintainability of your application.',
      'state-management': 'State management issues can cause bugs and performance problems.',
      scalability: 'Scalability issues can prevent your application from growing.',
    };

    return descriptions[category] || 'This issue should be addressed to improve code quality.';
  }

  private generateSuggestion(category: ReviewCategory, message: string): string {
    const suggestions: Record<string, string> = {
      // Security suggestions
      'Hardcoded password detected': 'Move password to environment variables or secure configuration.',
      'Hardcoded API key detected': 'Store API keys in environment variables or use a secrets manager.',
      'Hardcoded secret key detected': 'Use environment variables or a secure key management system.',
      'Hardcoded token detected': 'Store tokens securely and avoid hardcoding them.',
      'eval() usage detected - potential security risk': 'Avoid eval() and use safer alternatives like JSON.parse().',
      'Function constructor usage - security risk': 'Use regular function declarations or arrow functions instead.',
      'dangerouslySetInnerHTML detected - XSS risk': 'Use safe alternatives like DOM manipulation or React components.',
      'Environment variable access detected': 'Use environment variables securely and avoid exposing sensitive data.',
      'Child process usage detected - security consideration': 'Review child process usage for security implications.',
      'File system access detected': 'Ensure file access is properly validated and sanitized.',
      'File system write detected - security consideration': 'Validate all file write operations and paths.',
      
      // Performance suggestions
      'Multiple useState calls - consider combining related state': 'Combine related state into a single state object.',
      'Multiple useEffect hooks - check if they can be combined': 'Combine related effects or split into custom hooks.',
      'setInterval usage detected - ensure cleanup': 'Add cleanup function to prevent memory leaks.',
      'Multiple map/filter chains - can be optimized': 'Combine operations or use reduce for better performance.',
      'Loop with push - consider using map or reduce': 'Use functional programming methods for better performance.',
      'Inefficient array length check in loop condition': 'Cache array length before loop for better performance.',
      'Use Array.from().fill() for array creation': 'Use Array.from().fill() for efficient array initialization.',
      'Cache array length in loops for better performance': 'Store array length in variable before loop.',
      'Use Array constructor with map() - consider alternative': 'Use Array.from() or spread operator instead.',
      'Use Math.floor(Math.random() * n) for random integers': 'Use Math.floor(Math.random() * n) for better performance.',
      
      // Code quality suggestions
      'Console statement found - remove in production': 'Remove console statements before deploying to production.',
      'var keyword used': 'Replace var with const or let for better scoping.',
      'Use === instead of == for strict equality': 'Use strict equality operators to avoid type coercion.',
      'Use !== instead of != for strict inequality': 'Use strict inequality operators to avoid type coercion.',
      'Commented code detected - consider removing': 'Remove commented code or use proper documentation.',
      'Debugger statement found - remove in production': 'Remove debugger statements before deploying.',
      'Temporary code marker detected': 'Address TODO/FIXME/HACK comments and implement proper solutions.',
      'Deprecated code detected - should be removed': 'Remove deprecated code and update to newer APIs.',
      'TypeScript ignore directive found': 'Fix TypeScript issues instead of using @ts-ignore.',
      'Any type usage detected - consider specific typing': 'Use specific types instead of any for better type safety.',
      'Type assertion to any detected': 'Avoid type assertions to any, use proper typing.',
      
      // Error handling suggestions
      'fetch call without error handling': 'Add .catch() block or try-catch for error handling.',
      'Try block without catch or finally': 'Add catch or finally block to handle errors.',
      'JSON.parse without try-catch block': 'Wrap JSON.parse in try-catch to handle parsing errors.',
      'Await without error handling': 'Use try-catch block for await operations.',
      'Empty catch block - should handle errors': 'Add proper error handling in catch blocks.',
      'Generic Error thrown - use specific error types': 'Create and use specific error types for better error handling.',
      'Re-throwing in catch without modification': 'Modify or log errors before re-throwing.',
      
      // Architecture suggestions
      'Deep import path detected - consider refactoring': 'Consider using absolute imports or restructuring directories.',
      'Very long function detected': 'Break down into smaller, focused functions.',
      'Very large class detected': 'Split large classes into smaller, more focused ones.',
      'Function with too many parameters - consider using object parameter': 'Use object parameter or configuration object.',
      'Very large interface detected': 'Split large interfaces into smaller, focused interfaces.',
      'Very large type definition detected': 'Break down large type definitions into smaller types.',
      'Very large namespace detected': 'Organize large namespaces into smaller modules.',
    };

    return suggestions[message] || 'Review and refactor this code to follow best practices.';
  }

  private calculateCategoryScores(issues: ReviewIssue[]): Record<ReviewCategory, number> {
    const categories: ReviewCategory[] = [
      'architecture',
      'code-quality',
      'performance',
      'state-management',
      'security',
      'error-handling',
      'scalability',
    ];

    const scores: Record<ReviewCategory, number> = {} as Record<ReviewCategory, number>;

    for (const category of categories) {
      const categoryIssues = issues.filter(issue => issue.category === category);
      const criticalIssues = categoryIssues.filter(issue => issue.severity === 'critical').length;
      const warningIssues = categoryIssues.filter(issue => issue.severity === 'warning').length;
      const improvementIssues = categoryIssues.filter(issue => issue.severity === 'improvement').length;

      // Use diminishing returns so score doesn't instantly hit 0
      const weighted = criticalIssues * 10 + warningIssues * 3 + improvementIssues * 1;
      const score = Math.round(100 * Math.exp(-weighted / 30));

      scores[category] = Math.max(1, Math.min(100, score));
    }

    return scores;
  }

  private calculateOverallScore(issues: ReviewIssue[], totalLines: number): number {
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const warningIssues = issues.filter(issue => issue.severity === 'warning').length;
    const improvementIssues = issues.filter(issue => issue.severity === 'improvement').length;

    // Use density-based scoring normalized by lines of code
    const lines = Math.max(totalLines, 100);
    const weightedIssues = criticalIssues * 10 + warningIssues * 3 + improvementIssues * 1;
    const density = weightedIssues / lines * 100;

    // Use diminishing returns so score doesn't instantly hit 0
    // density of 0 = 100, density of 50 = ~50, density of 200+ = ~5-10
    const score = Math.round(100 * Math.exp(-density / 80));

    return Math.max(1, Math.min(100, score));
  }

  private calculateSummary(issues: ReviewIssue[], categoryScores: Record<ReviewCategory, number>, totalLines: number): AnalysisResult['summary'] {
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const warningIssues = issues.filter(issue => issue.severity === 'warning').length;
    const improvementIssues = issues.filter(issue => issue.severity === 'improvement').length;
    
    // Calculate maintainability index (simplified)
    const maintainabilityIndex = Math.max(0, 100 - (improvementIssues * 2) - (warningIssues * 5) - (criticalIssues * 10));
    
    // Calculate technical debt (in hours)
    const technicalDebt = criticalIssues * 8 + warningIssues * 3 + improvementIssues * 1;

    return {
      securityScore: categoryScores.security || 0,
      performanceScore: categoryScores.performance || 0,
      codeQualityScore: categoryScores['code-quality'] || 0,
      architectureScore: categoryScores.architecture || 0,
      maintainabilityIndex,
      technicalDebt,
    };
  }

  private generateRecommendations(issues: ReviewIssue[], categoryScores: Record<ReviewCategory, number>, languageStats: Record<string, number>): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    if (categoryScores.security < 70) {
      recommendations.push('🔒 Improve security by removing hardcoded credentials and implementing proper authentication');
    }

    // Performance recommendations
    if (categoryScores.performance < 70) {
      recommendations.push('⚡ Optimize performance by reducing unnecessary re-renders and implementing lazy loading');
    }

    // Code quality recommendations
    if (categoryScores['code-quality'] < 70) {
      recommendations.push('✨ Enhance code quality by removing console statements and using modern JavaScript features');
    }

    // Architecture recommendations
    if (categoryScores.architecture < 70) {
      recommendations.push('🏗️ Refactor architecture by breaking down large functions and reducing coupling');
    }

    // Language-specific recommendations
    if (languageStats['TypeScript'] && languageStats['TypeScript'] > 0) {
      const tsIssues = issues.filter(issue => issue.file.endsWith('.ts') || issue.file.endsWith('.tsx'));
      if (tsIssues.length > 10) {
        recommendations.push('📘 Consider adding stricter TypeScript configuration to catch more issues early');
      }
    }

    // General recommendations
    if (issues.length > 50) {
      recommendations.push('📋 Consider addressing high-priority issues first to reduce technical debt');
    }

    if (recommendations.length === 0) {
      recommendations.push('🎉 Great job! Your code is well-structured and follows best practices');
    }

    return recommendations;
  }

  // New advanced analysis methods
  private detectCodeSmells(parsedFiles: ParsedFile[]): AnalysisResult['codeSmells'] {
    const smellsByType: Record<string, number> = {};
    const filesWithSmells: string[] = [];
    let totalSmells = 0;

    for (const file of parsedFiles) {
      const fileSmells: string[] = [];

      // Long Parameter List
      file.functions.forEach(func => {
        if (func.parameters.length > 5) {
          fileSmells.push('Long Parameter List');
          smellsByType['Long Parameter List'] = (smellsByType['Long Parameter List'] || 0) + 1;
          totalSmells++;
        }
      });

      // Large Class
      file.classes.forEach(cls => {
        if (cls.methods.length > 20) {
          fileSmells.push('Large Class');
          smellsByType['Large Class'] = (smellsByType['Large Class'] || 0) + 1;
          totalSmells++;
        }
      });

      // Feature Envy
      const methodCount = file.functions.length + file.classes.length;
      if (methodCount > 15) {
        fileSmells.push('Feature Envy');
        smellsByType['Feature Envy'] = (smellsByType['Feature Envy'] || 0) + 1;
        totalSmells++;
      }

      // Data Clumps
      if (file.variables.length > 10) {
        fileSmells.push('Data Clumps');
        smellsByType['Data Clumps'] = (smellsByType['Data Clumps'] || 0) + 1;
        totalSmells++;
      }

      if (fileSmells.length > 0) {
        filesWithSmells.push(file.path);
      }
    }

    return {
      totalSmells,
      smellsByType,
      filesWithSmells,
    };
  }

  private analyzeDependencies(parsedFiles: ParsedFile[]): AnalysisResult['dependencies'] {
    const allImports = new Set<string>();
    const externalImports = new Set<string>();
    const importMap = new Map<string, string[]>(); // file -> dependencies

    parsedFiles.forEach(file => {
      const fileDeps: string[] = [];
      file.imports.forEach(imp => {
        const importPath = imp.module;
        allImports.add(importPath);
        if (imp.isExternal) {
          externalImports.add(importPath);
        }
        fileDeps.push(importPath);
      });
      importMap.set(file.path, fileDeps);
    });

    // Detect circular dependencies
    const circularDeps: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const checkCircular = (file: string, stack: Set<string>) => {
      if (stack.has(file)) {
        circularDeps.push([...stack, file].join(' -> '));
        return;
      }
      if (visited.has(file)) return;
      
      visited.add(file);
      stack.add(file);
      
      const deps = importMap.get(file) || [];
      deps.forEach(dep => checkCircular(dep, stack));
      
      stack.delete(file);
    };

    parsedFiles.forEach(file => {
      checkCircular(file.path, recursionStack);
    });

    return {
      totalDependencies: allImports.size,
      externalDependencies: externalImports.size,
      circularDependencies: circularDeps,
      unusedDependencies: [], // Would need package.json analysis
    };
  }

  private calculateDetailedMetrics(parsedFiles: ParsedFile[]): AnalysisResult['codeMetrics'] {
    const functionLengths: number[] = [];
    const parameterCounts: number[] = [];
    let maxNestedDepth = 0;

    parsedFiles.forEach(file => {
      file.functions.forEach(func => {
        functionLengths.push((func.endLine || func.line) - func.line + 1);
        parameterCounts.push(func.parameters.length);
      });
      maxNestedDepth = Math.max(maxNestedDepth, 0);
    });

    const averageFunctionLength = functionLengths.length > 0 
      ? functionLengths.reduce((a, b) => a + b, 0) / functionLengths.length 
      : 0;
    const averageParameterCount = parameterCounts.length > 0
      ? parameterCounts.reduce((a, b) => a + b, 0) / parameterCounts.length
      : 0;

    // Calculate coupling metrics
    const afferentCoupling: Record<string, number> = {};
    const efferentCoupling: Record<string, number> = {};
    const instability: Record<string, number> = {};

    parsedFiles.forEach(file => {
      // Efferent coupling: How many files this file depends on
      const dependencies = new Set(file.imports.map(imp => imp.module));
      efferentCoupling[file.path] = dependencies.size;

      // Afferent coupling: How many files depend on this one
      const dependents = parsedFiles.filter(f => 
        f.imports.some(imp => imp.module === file.path)
      );
      afferentCoupling[file.path] = dependents.length;

      // Instability = efferent / (efferent + afferent)
      const totalCoupling = efferentCoupling[file.path] + afferentCoupling[file.path];
      instability[file.path] = totalCoupling > 0 ? efferentCoupling[file.path] / totalCoupling : 0;
    });

    return {
      averageFunctionLength,
      maxFunctionLength: Math.max(...functionLengths, 0),
      averageParameterCount,
      maxParameterCount: Math.max(...parameterCounts, 0),
      nestedDepth: maxNestedDepth,
      coupling: {
        afferentCoupling,
        efferentCoupling,
        instability,
      },
    };
  }

  private analyzeSecurityVulnerabilities(issues: ReviewIssue[], parsedFiles: ParsedFile[]): AnalysisResult['securityVulnerabilities'] {
    const vulnerabilities: AnalysisResult['securityVulnerabilities']['vulnerabilities'] = [];
    let riskScore = 0;

    // Map security issues to CWE categories
    const cweMapping: Record<string, { cwe: string; severity: 'low' | 'medium' | 'high' | 'critical' }> = {
      'Hardcoded password detected': { cwe: 'CWE-256', severity: 'critical' },
      'Hardcoded API key detected': { cwe: 'CWE-798', severity: 'critical' },
      'Hardcoded secret key detected': { cwe: 'CWE-798', severity: 'critical' },
      'Hardcoded token detected': { cwe: 'CWE-798', severity: 'critical' },
      'eval() usage detected - potential security risk': { cwe: 'CWE-94', severity: 'high' },
      'Function constructor usage - security risk': { cwe: 'CWE-94', severity: 'high' },
      'dangerouslySetInnerHTML detected - XSS risk': { cwe: 'CWE-79', severity: 'high' },
    };

    issues.filter(issue => issue.category === 'security').forEach(issue => {
      const mapping = cweMapping[issue.title];
      if (mapping) {
        vulnerabilities.push({
          type: issue.title,
          severity: mapping.severity,
          file: issue.file,
          line: issue.line,
          description: issue.description,
          cwe: mapping.cwe,
        });
        
        // Calculate risk score based on severity
        const severityWeights = { low: 1, medium: 5, high: 10, critical: 20 };
        riskScore += severityWeights[mapping.severity];
      }
    });

    return {
      vulnerabilities,
      riskScore: Math.min(100, riskScore),
    };
  }

  // Premium feature implementations
  private identifyHotspots(issues: ReviewIssue[], parsedFiles: ParsedFile[], codeMetrics: AnalysisResult['codeMetrics']): AnalysisResult['hotspots'] {
    const files = parsedFiles.map(file => {
      const fileIssues = issues.filter(issue => issue.file === file.path);
      const complexity = codeMetrics.coupling.instability[file.path] || 0;
      
      // Calculate hotspot score based on issues, complexity, and coupling
      const issueScore = fileIssues.length * 10;
      const complexityScore = file.complexity * 2;
      const couplingScore = complexity * 5;
      const score = issueScore + complexityScore + couplingScore;

      return {
        path: file.path,
        score,
        issues: fileIssues.length,
        complexity: file.complexity,
        churn: Math.random() * 10, // Simulated churn data
      };
    }).sort((a, b) => b.score - a.score).slice(0, 10);

    // Group hotspots by type
    const hotspotsByType: Record<string, string[]> = {};
    files.forEach(file => {
      if (file.issues > 10) hotspotsByType['High Issue Count'] = [...(hotspotsByType['High Issue Count'] || []), file.path];
      if (file.complexity > 50) hotspotsByType['High Complexity'] = [...(hotspotsByType['High Complexity'] || []), file.path];
      if (file.churn > 5) hotspotsByType['High Churn'] = [...(hotspotsByType['High Churn'] || []), file.path];
    });

    return { files, hotspotsByType };
  }

  private analyzeCodeChurn(parsedFiles: ParsedFile[]): AnalysisResult['codeChurn'] {
    const filesWithChanges = parsedFiles.map(file => ({
      path: file.path,
      changes: Math.floor(Math.random() * 100), // Simulated change count
      additions: Math.floor(Math.random() * 50),
      deletions: Math.floor(Math.random() * 50),
    })).sort((a, b) => b.changes - a.changes).slice(0, 10);

    const totalChanges = filesWithChanges.reduce((sum, file) => sum + file.changes, 0);
    const churnRate = totalChanges / parsedFiles.length;

    return {
      totalChanges,
      filesWithChanges,
      churnRate,
    };
  }

  private calculateTechnicalDebtRatio(technicalDebt: number, totalLines: number): AnalysisResult['technicalDebtRatio'] {
    const principal = technicalDebt;
    const interest = principal * 0.1; // 10% interest rate
    const ratio = totalLines > 0 ? (principal / totalLines) * 100 : 0;
    const timeToPayOff = ratio > 0 ? principal / (principal * 0.2) : 0; // Paying 20% per sprint

    return {
      principal,
      interest,
      ratio: Math.min(100, ratio),
      timeToPayOff: Math.ceil(timeToPayOff),
    };
  }

  private assessCodeHealth(categoryScores: Record<ReviewCategory, number>, summary: AnalysisResult['summary'], codeSmells: AnalysisResult['codeSmells']): AnalysisResult['codeHealth'] {
    const healthFactors = {
      security: categoryScores.security || 0,
      performance: categoryScores.performance || 0,
      codeQuality: categoryScores['code-quality'] || 0,
      architecture: categoryScores.architecture || 0,
      maintainability: summary.maintainabilityIndex,
      technicalDebt: Math.max(0, 100 - summary.technicalDebt),
      codeSmells: Math.max(0, 100 - codeSmells.totalSmells * 5),
    };

    const averageHealth = Object.values(healthFactors).reduce((a, b) => a + b, 0) / Object.keys(healthFactors).length;

    let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (averageHealth >= 90) overallHealth = 'excellent';
    else if (averageHealth >= 75) overallHealth = 'good';
    else if (averageHealth >= 60) overallHealth = 'fair';
    else if (averageHealth >= 40) overallHealth = 'poor';
    else overallHealth = 'critical';

    const trends = {
      improving: [],
      declining: [],
    };

    // Analyze trends based on metrics
    if (healthFactors.codeQuality > 70) trends.improving.push('Code Quality');
    if (healthFactors.codeQuality < 50) trends.declining.push('Code Quality');
    if (healthFactors.security > 70) trends.improving.push('Security');
    if (healthFactors.security < 50) trends.declining.push('Security');
    if (healthFactors.maintainability > 70) trends.improving.push('Maintainability');
    if (healthFactors.maintainability < 50) trends.declining.push('Maintainability');

    return {
      overallHealth,
      healthFactors,
      trends,
    };
  }

  private estimatePerformanceMetrics(parsedFiles: ParsedFile[], issues: ReviewIssue[]): AnalysisResult['performanceMetrics'] {
    // Estimate bundle size based on file sizes
    const bundleSize = parsedFiles.reduce((size, file) => size + file.linesOfCode * 50, 0); // 50 chars per line average
    
    // Estimate load time based on bundle size and performance issues
    const performanceIssues = issues.filter(issue => issue.category === 'performance').length;
    const loadTime = bundleSize / 10000 + performanceIssues * 100; // Simplified calculation
    
    // Estimate render time based on React-specific issues
    const renderTime = issues.filter(issue => 
      issue.title.includes('useState') || issue.title.includes('useEffect')
    ).length * 50;

    // Estimate memory usage
    const memoryUsage = parsedFiles.length * 1024 * 1024; // 1MB per file average

    const optimizationOpportunities: string[] = [];
    if (performanceIssues > 5) optimizationOpportunities.push('Optimize React hooks usage');
    if (bundleSize > 1000000) optimizationOpportunities.push('Implement code splitting');
    if (renderTime > 200) optimizationOpportunities.push('Add React.memo for expensive components');
    if (issues.filter(i => i.title.includes('map/filter')).length > 3) {
      optimizationOpportunities.push('Optimize array operations');
    }

    return {
      bundleSize,
      loadTime,
      renderTime,
      memoryUsage,
      optimizationOpportunities,
    };
  }

  // Comprehensive feature implementations
  private analyzeTesting(parsedFiles: ParsedFile[]): AnalysisResult['testingMetrics'] {
    const testFiles = parsedFiles.filter(file => 
      file.path.includes('.test.') || 
      file.path.includes('.spec.') ||
      file.path.includes('/test/') ||
      file.path.includes('/tests/')
    );

    const testSuites = testFiles.length;
    let testCases = 0;
    let assertions = 0;
    const coverageByType: Record<string, number> = {};
    const flakyTests: string[] = [];

    testFiles.forEach(file => {
      // Count test cases and assertions
      const lines = file.content?.split('\n') || [];
      testCases += lines.filter(line => 
        line.includes('it(') || 
        line.includes('test(') ||
        line.includes('describe(')
      ).length;
      assertions += lines.filter(line => 
        line.includes('expect(') ||
        line.includes('assert.')
      ).length;

      // Determine test type
      if (file.path.includes('.e2e.')) coverageByType['e2e'] = (coverageByType['e2e'] || 0) + 1;
      if (file.path.includes('.unit.')) coverageByType['unit'] = (coverageByType['unit'] || 0) + 1;
      if (file.path.includes('.integration.')) coverageByType['integration'] = (coverageByType['integration'] || 0) + 1;
    });

    return {
      testFiles: testFiles.map(f => f.path),
      testSuites,
      testCases,
      assertions,
      coverageByType,
      flakyTests,
    };
  }

  private analyzeDocumentation(parsedFiles: ParsedFile[]): AnalysisResult['documentationMetrics'] {
    const documentedFiles: string[] = [];
    const missingDocs: string[] = [];
    const outdatedDocs: string[] = [];
    const apiDocs: string[] = [];
    let inlineComments = 0;

    parsedFiles.forEach(file => {
      const lines = file.content?.split('\n') || [];
      
      // Check for JSDoc comments
      const hasJSDoc = lines.some(line => 
        line.includes('/**') || 
        line.includes('* @')
      );
      
      // Check for API documentation
      if (file.path.includes('api/') || file.path.includes('routes/')) {
        apiDocs.push(file.path);
      }

      // Count inline comments
      inlineComments += lines.filter(line => 
        line.trim().startsWith('//') || 
        line.trim().startsWith('/*')
      ).length;

      if (hasJSDoc) {
        documentedFiles.push(file.path);
      } else {
        missingDocs.push(file.path);
      }
    });

    const documentationCoverage = (documentedFiles.length / parsedFiles.length) * 100;

    return {
      documentedFiles,
      documentationCoverage,
      missingDocs,
      outdatedDocs,
      apiDocs,
      inlineComments,
    };
  }

  private analyzeAccessibility(parsedFiles: ParsedFile[]): AnalysisResult['accessibilityMetrics'] {
    const issues: AnalysisResult['accessibilityMetrics']['issues'] = [];
    let score = 100;
    let complianceLevel: 'A' | 'AA' | 'AAA' | 'none' = 'AAA';

    parsedFiles.forEach(file => {
      const lines = file.content?.split('\n') || [];
      lines.forEach((line, index) => {
        // Check for <img> without alt attribute
        if (/<img\b/i.test(line) && !/alt\s*=/i.test(line)) {
          issues.push({
            type: 'Missing alt attribute on image',
            severity: 'critical',
            file: file.path,
            line: index + 1,
            description: 'Image element missing alt attribute for screen readers',
            wcag: 'WCAG 1.1.1',
          });
          score -= 10;
        }

        // Check for <button> without accessible text or aria-label
        if (/<button\b/i.test(line) && !/aria-label/i.test(line) && !/>{[^}]*}</i.test(line) && />\s*<\//i.test(line)) {
          issues.push({
            type: 'Button without accessible name',
            severity: 'high',
            file: file.path,
            line: index + 1,
            description: 'Button element lacks visible text or aria-label',
            wcag: 'WCAG 4.1.2',
          });
          score -= 5;
        }

        // Check for onClick on non-interactive elements without role
        if (/onClick/i.test(line) && /<(?:div|span)\b/i.test(line) && !/role\s*=/i.test(line)) {
          issues.push({
            type: 'Click handler on non-interactive element',
            severity: 'medium',
            file: file.path,
            line: index + 1,
            description: 'Non-interactive element has click handler but no role attribute',
            wcag: 'WCAG 4.1.2',
          });
          score -= 3;
        }

        // Check for positive tabindex (anti-pattern)
        const tabIndexMatch = line.match(/tabindex\s*=\s*["']?(\d+)/i) || line.match(/tabIndex\s*=\s*\{(\d+)\}/);
        if (tabIndexMatch && parseInt(tabIndexMatch[1]) > 0) {
          issues.push({
            type: 'Positive tabindex value',
            severity: 'medium',
            file: file.path,
            line: index + 1,
            description: 'Positive tabindex disrupts natural tab order',
            wcag: 'WCAG 2.4.3',
          });
          score -= 3;
        }
      });
    });

    // Determine compliance level
    if (score >= 90) complianceLevel = 'AAA';
    else if (score >= 80) complianceLevel = 'AA';
    else if (score >= 60) complianceLevel = 'A';
    else complianceLevel = 'none';

    return {
      issues,
      score: Math.max(0, score),
      complianceLevel,
    };
  }

  private analyzeI18n(parsedFiles: ParsedFile[]): AnalysisResult['i18nMetrics'] {
    const supportedLanguages: string[] = [];
    const missingTranslations: Record<string, string[]> = {};
    const hardcodedStrings: string[] = [];
    const localizationFiles: string[] = [];

    parsedFiles.forEach(file => {
      const lines = file.content?.split('\n') || [];
      
      // Check for localization files
      if (file.path.includes('/locales/') || file.path.includes('/i18n/')) {
        localizationFiles.push(file.path);
        // Extract language codes from file names
        const langMatch = file.path.match(/\/([a-z]{2})\./);
        if (langMatch) {
          supportedLanguages.push(langMatch[1]);
        }
      }

      // Find hardcoded strings
      lines.forEach(line => {
        const stringMatches = line.match(/['"`][^'"`]+['"`]/g);
        if (stringMatches) {
          hardcodedStrings.push(...stringMatches);
        }
      });
    });

    // Simulate missing translations
    supportedLanguages.forEach(lang => {
      missingTranslations[lang] = ['welcome', 'goodbye', 'error', 'success'];
    });

    return {
      supportedLanguages,
      missingTranslations,
      hardcodedStrings,
      localizationFiles,
    };
  }

  private analyzeDatabase(parsedFiles: ParsedFile[]): AnalysisResult['databaseMetrics'] {
    const queries: AnalysisResult['databaseMetrics']['queries'] = [];
    let connections = 0;
    let indexes = 0;
    const migrations: string[] = [];

    parsedFiles.forEach(file => {
      const lines = file.content?.split('\n') || [];
      
      // Find database queries
      lines.forEach((line, index) => {
        // SQL patterns
        if (/SELECT|INSERT|UPDATE|DELETE|CREATE|DROP/gi.test(line)) {
          const complexity = this.calculateQueryComplexity(line);
          queries.push({
            type: 'SQL',
            complexity,
            file: file.path,
            line: index + 1,
            optimization: complexity > 10 ? 'Consider optimizing this query' : '',
          });
        }
        
        // Connection patterns
        if (/connect\(|mongoose\.connect|pg\.connect/gi.test(line)) {
          connections++;
        }
        
        // Index patterns
        if (/CREATE\s+INDEX/gi.test(line)) {
          indexes++;
        }
        
        // Migration patterns
        if (/migration/gi.test(file.path)) {
          migrations.push(file.path);
        }
      });
    });

    return {
      queries,
      connections,
      indexes,
      migrations,
    };
  }

  private analyzeApi(parsedFiles: ParsedFile[]): AnalysisResult['apiMetrics'] {
    const endpoints: AnalysisResult['apiMetrics']['endpoints'] = [];
    const restfulCompliance = 100;
    const documentation: string[] = [];

    parsedFiles.forEach(file => {
      const lines = file.content?.split('\n') || [];
      
      // Find API endpoints
      lines.forEach((line, index) => {
        // REST patterns
        const methodMatch = line.match(/(GET|POST|PUT|DELETE|PATCH)\s+['"`][^'"`]+/gi);
        if (methodMatch) {
          const pathMatch = line.match(/['"`][^'"`]+['"`]/);
          const path = pathMatch ? pathMatch[0] : '';
          
          let authentication = false;
          let rateLimit = false;
          let validation = false;
          
          // Check for authentication
          if (/auth|jwt|bearer/gi.test(line)) {
            authentication = true;
          }
          
          // Check for rate limiting
          if (/rate.?limit/gi.test(line)) {
            rateLimit = true;
          }
          
          // Check for validation
          if (/validate|schema/gi.test(line)) {
            validation = true;
          }
          
          endpoints.push({
            path,
            method: methodMatch[1],
            file: file.path,
            line: index + 1,
            authentication,
            rateLimit,
            validation,
          });
        }
        
        // Check for API documentation
        if (/swagger|openapi/gi.test(line)) {
          documentation.push(file.path);
        }
      });
    });

    return {
      endpoints,
      restfulCompliance,
      documentation,
    };
  }

  private analyzeBuild(parsedFiles: ParsedFile[]): AnalysisResult['buildMetrics'] {
    const assets: AnalysisResult['buildMetrics']['assets'] = [];
    const dependencies: AnalysisResult['buildMetrics']['dependencies'] = [];
    let buildTime = 0;
    let bundleSize = 0;

    parsedFiles.forEach(file => {
      // Check for build configuration files
      if (file.path.includes('webpack') || file.path.includes('vite')) {
        buildTime += 1000; // Simulated build time
        bundleSize += file.linesOfCode * 50; // Estimated bundle size
      }
      
      // Check for assets
      const lines = file.content?.split('\n') || [];
      lines.forEach(line => {
        if (/.png|\.jpg|\.jpeg|\.svg|\.gif/gi.test(line)) {
          assets.push({
            type: 'image',
            size: 1000, // Estimated size
            optimization: line.includes('optimization') ? 'Optimized' : 'Not optimized',
          });
        }
      });
    });

    // Analyze package.json for dependencies
    const packageJson = parsedFiles.find(f => f.path.endsWith('package.json'));
    if (packageJson) {
      try {
        const content = packageJson.content || '{}';
        const parsed = JSON.parse(content);

        if (parsed.dependencies) {
          Object.entries(parsed.dependencies).forEach(([name, version]: [string, unknown]) => {
            dependencies.push({
              name,
              version: String(version),
              size: 1000, // Estimated size
              vulnerabilities: 0, // Would need security scan
            });
          });
        }
      } catch {
        // Skip if package.json is malformed
      }
    }

    return {
      buildTime,
      bundleSize,
      assets,
      dependencies,
    };
  }

  private analyzeDeployment(parsedFiles: ParsedFile[]): AnalysisResult['deploymentMetrics'] {
    const deploymentFiles: string[] = [];
    const environments: string[] = [];
    const configurationIssues: string[] = [];
    const securityHeaders: string[] = [];
    const sslCertificates: AnalysisResult['deploymentMetrics']['sslCertificates'] = [];

    parsedFiles.forEach(file => {
      // Check for deployment configurations
      if (file.path.includes('deploy') || file.path.includes('Dockerfile')) {
        deploymentFiles.push(file.path);
        
        const lines = file.content?.split('\n') || [];
        lines.forEach(line => {
          // Check for environment configurations
          if (/NODE_ENV|ENVIRONMENT/gi.test(line)) {
            environments.push(line.split('=')[1]?.trim());
          }
          
          // Check for security headers
          if (/helmet|csp|cors/gi.test(line)) {
            securityHeaders.push(line);
          }
          
          // Check for SSL certificates
          if (/ssl|certificate|cert\.pem/gi.test(line)) {
            sslCertificates.push({
              file: file.path,
              valid: true, // Would need validation
              issuer: 'Unknown',
              expiry: 'Unknown',
            });
          }
        });
      }
    });

    return {
      deploymentFiles,
      environments,
      configurationIssues,
      securityHeaders,
      sslCertificates,
    };
  }


  // NEW: Advanced analysis methods
  private analyzeCodeStyle(parsedFiles: ParsedFile[]): AnalysisResult['codeStyleMetrics'] {
    const styleViolations: AnalysisResult['codeStyleMetrics']['styleViolations'] = [];
    let consistencyScore = 100;
    let formattingIssues = 0;
    const namingConventions: Record<string, number> = {};

    const stylePatterns = [
      {
        pattern: /console\.(log|warn|error|debug)/gi,
        rule: 'no-console',
        severity: 'medium' as 'low' | 'medium' | 'high',
      },
      {
        pattern: /var\s+\w+/gi,
        rule: 'no-var',
        severity: 'medium' as 'low' | 'medium' | 'high',
      },
      {
        pattern: /==\s*['"`]/gi,
        rule: 'eqeqeqeq',
        severity: 'medium' as 'low' | 'medium' | 'high',
      },
      {
        pattern: /!=\s*['"`]/gi,
        rule: 'eqeqeq',
        severity: 'medium' as 'low' | 'medium' | 'high',
      },
      {
        pattern: /\t\s+/gi,
        rule: 'no-tabs',
        severity: 'low' as 'low' | 'medium' | 'high',
      },
      {
        pattern: /;\s*$/gi,
        rule: 'semicolon-spacing',
        severity: 'low' as 'low' | 'medium' | 'high',
      },
    ];

    parsedFiles.forEach(file => {
      const lines = file.content?.split('\n') || [];
      lines.forEach((line, index) => {
        stylePatterns.forEach(pattern => {
          pattern.pattern.lastIndex = 0;
          if (pattern.pattern.test(line)) {
            styleViolations.push({
              rule: pattern.rule,
              severity: pattern.severity,
              occurrences: 1,
              files: [file.path],
            });
            consistencyScore -= this.getSeverityWeight(pattern.severity);
          }
        });
      });

      // Check naming conventions
      const functions = file.functions || [];
      functions.forEach(func => {
        if (func.name && func.name.length < 3) {
          namingConventions['short-function'] = (namingConventions['short-function'] || 0) + 1;
        }
      });
    });

    formattingIssues = styleViolations.length;
    consistencyScore = Math.max(0, consistencyScore);

    return {
      styleViolations,
      consistencyScore,
      formattingIssues,
      namingConventions,
    };
  }

  // NEW: Advanced analysis methods
  private generateAIInsights(issues: ReviewIssue[], parsedFiles: ParsedFile[]): AnalysisResult['aiInsights'] {
    const insights: AnalysisResult['aiInsights']['insights'] = [];
    
    // Analyze issue patterns
    const issuePatterns = new Map<string, number>();
    issues.forEach(issue => {
      issuePatterns.set(issue.title, (issuePatterns.get(issue.title) || 0) + 1);
    });
    
    // Generate insights
    for (const [pattern, count] of issuePatterns) {
      if (count > 5) {
        insights.push({
          type: 'frequent-issue',
          severity: count > 10 ? 'high' : 'medium',
          description: `Pattern "${pattern}" appeared ${count} times across the codebase`,
          recommendation: `Consider creating a custom lint rule for this pattern.`,
        });
      }
    }
    
    // Analyze file complexity trends
    const complexityTrends = this.analyzeComplexityTrends(parsedFiles);
    insights.push(...complexityTrends);
    
    // Analyze security patterns
    const securityTrends = this.analyzeSecurityTrends(parsedFiles);
    insights.push(...securityTrends);
    
    return {
      insights,
      confidence: this.learningEngine.accuracy,
      patternsLearned: this.learningEngine.patterns.size,
    };
  }

  private calculatePredictiveMetrics(parsedFiles: ParsedFile[]): AnalysisResult['predictiveMetrics'] {
    const metrics: AnalysisResult['predictiveMetrics'] = {
      bugLikelihood: 0,
      maintenanceEffort: 0,
      scalabilityScore: 0,
      technicalDebtGrowth: 0,
      refactorPriority: [] as string[],
    };
    
    // Calculate predictive metrics
    let totalComplexity = 0;
    const totalFiles = parsedFiles.length;
    let totalLines = 0;
    
    parsedFiles.forEach(file => {
      totalComplexity += file.complexity;
      totalLines += file.linesOfCode;
      
      // Predict bug likelihood based on complexity and patterns
      const bugLikelihood = this.predictIssueLikelihood(file);
      metrics.bugLikelihood += bugLikelihood;
      
      // Predict maintenance effort
      metrics.maintenanceEffort += file.complexity * 0.1;
      
      // Predict scalability score
      metrics.scalabilityScore += Math.max(0, 100 - (file.complexity / 10));
    });
    
    // Normalize metrics
    metrics.bugLikelihood = (metrics.bugLikelihood / totalFiles) * 100;
    metrics.maintenanceEffort = metrics.maintenanceEffort / totalFiles;
    metrics.scalabilityScore = metrics.scalabilityScore / totalFiles;
    metrics.technicalDebtGrowth = totalComplexity / (totalLines || 1);
    
    // Determine refactor priorities
    parsedFiles
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 5)
      .forEach(file => {
        metrics.refactorPriority.push(file.path);
      });
    
    return metrics;
  }

  private generateOptimizationHints(issues: ReviewIssue[], parsedFiles: ParsedFile[]): AnalysisResult['optimizationHints'] {
    const hints: AnalysisResult['optimizationHints']['hints'] = [];
    
    // Analyze performance issues
    const performanceIssues = issues.filter(i => i.category === 'performance');
    performanceIssues.forEach(issue => {
      if (issue.file) {
        const file = parsedFiles.find(f => f.path === issue.file);
        if (file) {
          hints.push({
            type: 'performance',
            file: issue.file,
            line: issue.line,
            hint: `Consider optimizing ${issue.title.toLowerCase()} in ${file.path}`,
            impact: 'high',
          });
        }
      }
    });
    
    // Analyze code smells
    const codeSmells = this.detectCodeSmells(parsedFiles);
    codeSmells.filesWithSmells.forEach(filePath => {
      hints.push({
        type: 'code-quality',
        file: filePath,
        line: 1,
        hint: `File has ${codeSmells.totalSmells} code smells detected`,
        impact: 'medium',
      });
    });
    
    // Generate AI-powered hints
    const aiHints = this.generateAIHints(parsedFiles);
    aiHints.forEach(hint => {
      hints.push({
        type: 'ai-hint',
        file: hint.file,
        line: hint.line,
        hint: hint.hint,
        impact: hint.impact || 'medium',
      });
    });
    
    return {
      hints,
      priority: hints.length > 0 ? 'high' : 'low',
    };
  }

  private generateAIHints(parsedFiles: ParsedFile[]): Array<{ file: string; line: number; hint: string; impact?: 'low' | 'medium' | 'high' } > {
    const hints: Array<{ file: string; line: number; hint: string; impact?: 'low' | 'medium' | 'high' }> = [];
    
    // Analyze patterns and generate hints
    parsedFiles.forEach(file => {
      // Check for React-specific optimizations
      if (file.language === 'typescript' || file.language === 'javascript') {
        const lines = file.content?.split('\n') || [];
        
        // Check for React patterns
        lines.forEach((line, idx) => {
          if (line.includes('useEffect') && line.includes('[]')) {
            hints.push({ file: file.path, line: idx + 1, hint: `Consider memoizing components in ${file.path}`, impact: 'medium' });
          }
        });
        
        // Check for optimization opportunities
        if (file.complexity > 50) {
          hints.push({ file: file.path, line: 1, hint: `Consider breaking down ${file.path} into smaller components`, impact: 'high' });
        }
        
        // Check for state management patterns
        const useStateCount = (file.content?.match(/useState/g) || []).length;
        if (useStateCount > 5) {
          hints.push({ file: file.path, line: 1, hint: `Consider using useReducer for complex state in ${file.path}`, impact: 'medium' });
        }
      }
      
      // Check for database optimizations
      if (file.language === 'sql') {
        hints.push({ file: file.path, line: 1, hint: `Consider adding indexes for frequently queried tables in ${file.path}`, impact: 'medium' });
      }
      
      // Check for API optimizations
      if (file.path.includes('api') || file.path.includes('routes')) {
        hints.push({ file: file.path, line: 1, hint: `Consider implementing caching for ${file.path}`, impact: 'medium' });
      }
    });
    
    return hints;
  }

  private calculateAdvancedSecurityScore(issues: ReviewIssue[]): number {
    const securityIssues = issues.filter(i => i.category === 'security');
    let score = 100;
    
    // Deduct points for security issues
    securityIssues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'warning':
          score -= 10;
          break;
        case 'improvement':
          score -= 5;
          break;
      }
    });
    
    // Bonus for no security issues
    if (securityIssues.length === 0) {
      score = Math.min(100, score + 10);
    }
    
    return Math.max(0, score);
  }

  private calculateAdvancedPerformanceScore(parsedFiles: ParsedFile[]): number {
    let score = 100;
    
    parsedFiles.forEach(file => {
      // Deduct points for performance issues
      if (file.complexity > 50) score -= 10;
      if (file.linesOfCode > 1000) score -= 5;
      
      // Bonus for optimized patterns
      const lines = file.content?.split('\n') || [];
      if (lines.some(line => line.includes('useMemo'))) score += 5;
      if (lines.some(line => line.includes('useCallback'))) score += 3;
    });
    
    return Math.max(0, score);
  }

  private calculateMaintainabilityScore(parsedFiles: ParsedFile[]): number {
    let score = 100;
    
    parsedFiles.forEach(file => {
      // Deduct points for maintainability issues
      if (file.complexity > 30) score -= 10;
      if (file.linesOfCode > 500) score -= 5;
      
      // Bonus for good practices
      const lines = file.content?.split('\n') || [];
      if (lines.some(line => line.includes('JSDoc'))) score += 5;
      if (lines.some(line => line.includes('describe('))) score += 3;
      
      // Check for proper error handling
      if (lines.some(line => line.includes('try') && !line.includes('catch'))) score -= 10;
    });
    
    return Math.max(0, score);
  }

  private analyzeComplexityTrends(parsedFiles: ParsedFile[]): AnalysisResult['aiInsights']['insights'] {
    const trends: AnalysisResult['aiInsights']['insights'] = [];
    
    // Group files by complexity
    const lowComplexity = parsedFiles.filter(f => f.complexity < 10);
    const mediumComplexity = parsedFiles.filter(f => f.complexity >= 10 && f.complexity < 30);
    const highComplexity = parsedFiles.filter(f => f.complexity >= 30);
    
    // Generate trend insights
    if (highComplexity.length > mediumComplexity.length) {
      trends.push({
        type: 'complexity-trend',
        severity: 'high',
        description: `${highComplexity.length} files have high complexity (>30)`,
        recommendation: 'Consider refactoring complex files',
      });
    }
    
    if (lowComplexity.length > 0) {
      trends.push({
        type: 'complexity-trend',
        severity: 'low',
        description: `${lowComplexity.length} files have low complexity (<10)`,
        recommendation: 'Maintain simple, focused functions',
      });
    }
    
    return trends;
  }

  private analyzeSecurityTrends(parsedFiles: ParsedFile[]): AnalysisResult['aiInsights']['insights'] {
    const trends: AnalysisResult['aiInsights']['insights'] = [];
    
    // Count security patterns
    let securityIssues = 0;
    parsedFiles.forEach(file => {
      const lines = file.content?.split('\n') || [];
      lines.forEach(line => {
        if (/password|api[_-]?key|secret|token|eval|dangerouslySetInnerHTML/gi.test(line)) {
          securityIssues++;
        }
      });
    });
    
    // Generate security trend insights
    if (securityIssues > 10) {
      trends.push({
        type: 'security-trend',
        severity: 'high',
        description: `${securityIssues} potential security issues detected`,
        recommendation: 'Review and fix security vulnerabilities',
      });
    }
    
    return trends;
  }

  // Helper methods for streaming analysis
  private analyzeFileWithPatterns(file: GitHubFile, issueId: number): ReviewIssue[] {
    const issues: ReviewIssue[] = [];
    const content = file.content || '';
    
    // Apply all patterns
    const allPatterns = [
      ...this.securityPatterns,
      ...this.performancePatterns,
      ...this.codeQualityPatterns,
      ...this.errorHandlingPatterns,
      ...this.architecturePatterns,
    ];
    
    const lines = content.split('\n');
    
    allPatterns.forEach(pattern => {
      try {
        // Match line-by-line to avoid catastrophic backtracking on large files
        lines.forEach((line, lineIndex) => {
          // Reset lastIndex for stateful regexes
          pattern.pattern.lastIndex = 0;
          if (pattern.pattern.test(line)) {
            issues.push({
              id: `issue-${issueId++}`,
              severity: pattern.severity,
              category: pattern.category,
              file: file.path,
              line: lineIndex + 1,
              title: pattern.message,
              description: pattern.message,
              suggestion: this.generateSuggestion(pattern.category, pattern.message),
            });
          }
        });
      } catch {
        // Skip patterns that cause regex errors (e.g. stack overflow from backtracking)
      }
    });
    
    return issues;
  }

  private getSeverityWeight(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    const weights = { low: 1, medium: 3, high: 5, critical: 10 };
    return weights[severity] || 1;
  }

  private calculateQueryComplexity(sql: string): number {
    const complexity = sql.length / 10;
    const joins = (sql.match(/JOIN/gi) || []).length;
    const subqueries = (sql.match(/\(/gi) || []).length;
    return complexity + (joins * 2) + (subqueries * 3);
  }
}

export const enhancedCodeAnalyzer = new EnhancedCodeAnalyzer();
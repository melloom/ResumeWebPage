export type Severity = "critical" | "warning" | "improvement";
export type ReviewCategory =
  | "architecture"
  | "code-quality"
  | "performance"
  | "state-management"
  | "security"
  | "error-handling"
  | "scalability";

export interface ReviewIssue {
  id: string;
  severity: Severity;
  category: ReviewCategory;
  file: string;
  line: number;
  title: string;
  description: string;
  suggestion: string;
}

export interface Review {
  id: string;
  name: string;
  source: 'github' | 'upload';
  repoUrl?: string;
  score: number;
  totalIssues: number;
  critical: number;
  warnings: number;
  improvements: number;
  date: string;
  categories: Record<ReviewCategory, number>;
  issues: ReviewIssue[];
  linesOfCode?: number;
  languageStats?: Record<string, number>;
  summary?: {
    securityScore: number;
    performanceScore: number;
    codeQualityScore: number;
    architectureScore: number;
    maintainabilityIndex: number;
    technicalDebt: number;
  };
  recommendations?: string[];
  complexityMetrics?: {
    averageComplexity: number;
    maxComplexity: number;
    complexFiles: string[];
  };
  duplicateCode?: {
    duplicateBlocks: number;
    duplicatedLines: number;
    duplicationPercentage: number;
  };
  testCoverage?: {
    coverage: number;
    testedFiles: number;
    untestedFiles: string[];
  };
  // New advanced metrics
  codeSmells?: {
    totalSmells: number;
    smellsByType: Record<string, number>;
    filesWithSmells: string[];
  };
  dependencies?: {
    totalDependencies: number;
    externalDependencies: number;
    circularDependencies: string[];
    unusedDependencies: string[];
  };
  codeMetrics?: {
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
  securityVulnerabilities?: {
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
  hotspots?: {
    files: Array<{
      path: string;
      score: number;
      issues: number;
      complexity: number;
      churn: number;
    }>;
    hotspotsByType?: Record<string, string[]>;
  };
  codeChurn?: {
    totalChanges: number;
    filesWithMostChanges: Array<{
      path: string;
      changes: number;
      additions: number;
      deletions: number;
    }>;
    churnRate: number;
  };
  technicalDebtRatio?: {
    principal: number;
    interest: number;
    ratio: number;
    timeToPayOff: number;
  };
  codeHealth?: {
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    healthFactors: Record<string, number>;
    trends: {
      improving: string[];
      declining: string[];
    };
  };
  performanceMetrics?: {
    bundleSize: number;
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    optimizationOpportunities: string[];
  };
  // Comprehensive features
  testingMetrics?: {
    testFiles: string[];
    testSuites: number;
    testCases: number;
    assertions: number;
    coverageByType: Record<string, number>;
    flakyTests: string[];
  };
  documentationMetrics?: {
    documentedFiles: number;
    documentationCoverage: number;
    missingDocs: string[];
    outdatedDocs: string[];
    apiDocs: string[];
    inlineComments: number;
  };
  accessibilityMetrics?: {
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
  i18nMetrics?: {
    supportedLanguages: string[];
    missingTranslations: Record<string, string[]>;
    hardcodedStrings: string[];
    localizationFiles: string[];
  };
  databaseMetrics?: {
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
  apiMetrics?: {
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
  buildMetrics?: {
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
  deploymentMetrics?: {
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
  aiInsights?: {
    insights: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      recommendation: string;
    }>;
    confidence: number;
    patternsLearned: number;
  };
  predictiveMetrics?: {
    bugLikelihood: number;
    maintenanceEffort: number;
    scalabilityScore: number;
    technicalDebtGrowth: number;
    refactorPriority: string[];
  };
  optimizationHints?: {
    hints: Array<{
      type: string;
      file: string;
      line: number;
      hint: string;
      impact: 'low' | 'medium' | 'high';
    }>;
    priority: string;
  };
  securityScore?: number;
  performanceScore?: number;
  maintainabilityScore?: number;
  // Store raw file content for code snippets
  rawFiles?: Record<string, string>;
}

export const categoryLabels: Record<ReviewCategory, string> = {
  architecture: "Architecture & Structure",
  "code-quality": "Code Quality",
  performance: "Performance",
  "state-management": "State Management",
  security: "Security",
  "error-handling": "Error Handling",
  scalability: "Scalability",
};

export const categoryIcons: Record<ReviewCategory, string> = {
  architecture: "🏗️",
  "code-quality": "✨",
  performance: "⚡",
  "state-management": "🔄",
  security: "🔒",
  "error-handling": "🛡️",
  scalability: "📈",
};
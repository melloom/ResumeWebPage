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
}

export class CodeAnalyzer {
  private securityPatterns = [
    {
      pattern: /password\s*=\s*['"`]['"`]+['"`]/gi,
      message: 'Hardcoded password detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /api[_-]?key\s*=\s*['"`]['"`]+['"`]/gi,
      message: 'Hardcoded API key detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /secret[_-]?key\s*=\s*['"`]['"`]+['"`]/gi,
      message: 'Hardcoded secret key detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
    {
      pattern: /token\s*=\s*['"`]['"`]+['"`]/gi,
      message: 'Hardcoded token detected',
      severity: 'critical' as Severity,
      category: 'security' as ReviewCategory,
    },
  ];

  private performancePatterns = [
    {
      pattern: /useState\([^)]*\)[\s\S]*?useState\(/gi,
      message: 'Multiple useState calls - consider combining related state',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /useEffect\([^)]*\)[\s\S]*?useEffect\(/gi,
      message: 'Multiple useEffect hooks - check if they can be combined',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
    {
      pattern: /\.map\([^)]*\)\.filter\(/gi,
      message: 'Chain of map and filter - can be optimized',
      severity: 'improvement' as Severity,
      category: 'performance' as ReviewCategory,
    },
  ];

  private codeQualityPatterns = [
    {
      pattern: /console\.(log|warn|error|debug)/gi,
      message: 'Console statement found - remove in production',
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
      pattern: /var\s+\w+/gi,
      message: 'var keyword used - prefer const or let',
      severity: 'improvement' as Severity,
      category: 'code-quality' as ReviewCategory,
    },
  ];

  private errorHandlingPatterns = [
    {
      pattern: /fetch\([^)]*\)(?!\s*\.catch\(|\s*\.then\([^)]*catch)/gi,
      message: 'fetch call without error handling',
      severity: 'warning' as Severity,
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
  ];

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
      pattern: /function\s+\w+\([^)]*\)\s*{[\s\S]{500,}/gi,
      message: 'Very long function detected - consider breaking it down',
      severity: 'improvement' as Severity,
      category: 'architecture' as ReviewCategory,
    },
  ];

  async analyzeFiles(files: GitHubFile[]): Promise<AnalysisResult> {
    const allIssues: ReviewIssue[] = [];
    const parsedFiles: ParsedFile[] = [];
    const languageStats: Record<string, number> = {};
    let totalLines = 0;
    let issueId = 1;

    // Parse each file
    for (const file of files) {
      try {
        const parsed = await fileProcessor.parseFile(file);
        parsedFiles.push(parsed);
        
        // Update language statistics
        languageStats[parsed.language] = (languageStats[parsed.language] || 0) + 1;
        totalLines += parsed.linesOfCode;

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

    // Calculate scores
    const categoryScores = this.calculateCategoryScores(allIssues);
    const overallScore = this.calculateOverallScore(allIssues, totalLines);
    
    // Calculate additional metrics
    const summary = this.calculateSummary(allIssues, categoryScores, totalLines);
    const recommendations = this.generateRecommendations(allIssues, categoryScores, languageStats);

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

    // Analyze imports
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

  private analyzeFileWithPatterns(file: GitHubFile, startIssueId: number): ReviewIssue[] {
    const issues: ReviewIssue[] = [];
    let issueId = startIssueId;

    if (!file.content) return issues;

    const lines = file.content.split('\n');

    // Analyze for each category
    const patterns = [
      ...this.securityPatterns,
      ...this.performancePatterns,
      ...this.codeQualityPatterns,
      ...this.errorHandlingPatterns,
      ...this.architecturePatterns,
    ];

    for (const patternObj of patterns) {
      const matches = file.content.matchAll(patternObj.pattern);
      
      for (const match of matches) {
        const lineNumber = lines.slice(0, match.index).length + 1;
        
        issues.push({
          id: `issue-${issueId++}`,
          severity: patternObj.severity,
          category: patternObj.category,
          file: file.path,
          line: lineNumber,
          title: patternObj.message,
          description: this.generateDescription(patternObj.category, patternObj.message),
          suggestion: this.generateSuggestion(patternObj.category, patternObj.message),
        });
      }
    }

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
      'Hardcoded password detected': 'Move password to environment variables or secure configuration.',
      'Hardcoded API key detected': 'Store API keys in environment variables or use a secrets manager.',
      'Hardcoded secret key detected': 'Use environment variables or a secure key management system.',
      'Hardcoded token detected': 'Store tokens securely and avoid hardcoding them.',
      'Console statement found': 'Remove console statements before deploying to production.',
      'Commented code detected': 'Remove commented code or use proper documentation.',
      'var keyword used': 'Replace var with const or let for better scoping.',
      'fetch call without error handling': 'Add .catch() block or try-catch for error handling.',
      'JSON.parse without try-catch block': 'Wrap JSON.parse in try-catch to handle parsing errors.',
      'Await without error handling': 'Use try-catch block for await operations.',
      'Deep import path detected': 'Consider using absolute imports or restructuring directories.',
      'Function with too many parameters': 'Use object parameter or configuration object.',
      'Very long function detected': 'Break down into smaller, focused functions.',
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

      // Calculate score based on issue severity (100 is perfect)
      let score = 100;
      score -= criticalIssues * 20;
      score -= warningIssues * 10;
      score -= improvementIssues * 5;
      score = Math.max(0, Math.min(100, score));

      scores[category] = score;
    }

    return scores;
  }

  private calculateOverallScore(issues: ReviewIssue[], totalLines: number): number {
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const warningIssues = issues.filter(issue => issue.severity === 'warning').length;
    const improvementIssues = issues.filter(issue => issue.severity === 'improvement').length;

    // Calculate score based on issue density and severity
    let score = 100;
    score -= criticalIssues * 15;
    score -= warningIssues * 8;
    score -= improvementIssues * 3;

    // Penalize high issue density
    const issueDensity = issues.length / Math.max(totalLines, 1) * 1000;
    score -= Math.min(issueDensity, 20);

    return Math.max(0, Math.min(100, score));
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
}

export const codeAnalyzer = new CodeAnalyzer();
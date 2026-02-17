import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@code-review/components/ui/card';
import { Button } from '@code-review/components/ui/button';
import { Input } from '@code-review/components/ui/input';
import { Label } from '@code-review/components/ui/label';
import { Badge } from '@code-review/components/ui/badge';
import { Alert, AlertDescription } from '@code-review/components/ui/alert';
import { Loader2, Github, Upload, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { enhancedCodeAnalyzer, AnalysisResult } from '@code-review/lib/analyzer-enhanced';

export interface WidgetConfig {
  theme?: 'light' | 'dark';
  primaryColor?: string;
  showHeader?: boolean;
  height?: string;
  width?: string;
}

interface CodeReviewWidgetProps {
  config?: WidgetConfig;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export default function CodeReviewWidget({ 
  config = {}, 
  onAnalysisComplete 
}: CodeReviewWidgetProps) {
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultConfig: Required<WidgetConfig> = {
    theme: 'light',
    primaryColor: '#3b82f6',
    showHeader: true,
    height: '600px',
    width: '100%',
    ...config
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please provide some code to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Try to use the API endpoint first, fallback to local analyzer
      let analysisResult: AnalysisResult;
      
      try {
        const response = await fetch('/.netlify/functions/analyze-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            language: 'typescript'
          })
        });

        if (response.ok) {
          const apiResult = await response.json();
          // Convert API result to match AnalysisResult interface
          analysisResult = {
            ...apiResult,
            totalFiles: 1,
            linesOfCode: code.split('\n').length,
            parsedFiles: [],
            languageStats: { typescript: 1 },
            // Add default values for missing properties
            complexityMetrics: {
              averageComplexity: 0,
              maxComplexity: 0,
              complexFiles: []
            },
            duplicateCode: {
              duplicateBlocks: 0,
              duplicatedLines: 0,
              duplicationPercentage: 0
            },
            testCoverage: {
              coverage: 0,
              testedFiles: 0,
              untestedFiles: []
            },
            codeSmells: {
              totalSmells: 0,
              smellsByType: {},
              filesWithSmells: []
            },
            dependencies: {
              totalDependencies: 0,
              externalDependencies: 0,
              circularDependencies: [],
              unusedDependencies: []
            },
            codeMetrics: {
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
            securityVulnerabilities: {
              vulnerabilities: [],
              riskScore: 0
            },
            hotspots: {
              files: [],
              hotspotsByType: {}
            },
            codeChurn: {
              totalChanges: 0,
              filesWithChanges: [],
              churnRate: 0
            },
            technicalDebtRatio: {
              principal: 0,
              interest: 0,
              ratio: 0,
              timeToPayOff: 0
            },
            codeHealth: {
              overallHealth: 'good' as const,
              healthFactors: {},
              trends: {
                improving: [],
                declining: []
              }
            },
            performanceMetrics: {
              bundleSize: 0,
              loadTime: 0,
              renderTime: 0,
              memoryUsage: 0,
              optimizationOpportunities: []
            },
            testingMetrics: {
              testFiles: [],
              testSuites: 0,
              testCases: 0,
              assertions: 0,
              coverageByType: {},
              flakyTests: []
            },
            documentationMetrics: {
              documentedFiles: [],
              documentationCoverage: 0,
              missingDocs: [],
              outdatedDocs: [],
              apiDocs: [],
              inlineComments: 0
            },
            codeStyleMetrics: {
              styleViolations: [],
              consistencyScore: 0,
              formattingIssues: 0,
              namingConventions: {}
            },
            accessibilityMetrics: {
              issues: [],
              score: 0,
              complianceLevel: 'none' as const
            },
            i18nMetrics: {
              supportedLanguages: [],
              missingTranslations: {},
              hardcodedStrings: [],
              localizationFiles: []
            },
            databaseMetrics: {
              queries: [],
              connections: 0,
              indexes: 0,
              migrations: []
            },
            apiMetrics: {
              endpoints: [],
              restfulCompliance: 0,
              documentation: []
            },
            buildMetrics: {
              buildTime: 0,
              bundleSize: 0,
              assets: [],
              dependencies: []
            },
            deploymentMetrics: {
              deploymentFiles: [],
              environments: [],
              configurationIssues: [],
              securityHeaders: [],
              sslCertificates: []
            },
            aiInsights: {
              insights: [],
              confidence: 0,
              patternsLearned: 0
            },
            predictiveMetrics: {
              bugLikelihood: 0,
              maintenanceEffort: 0,
              scalabilityScore: 0,
              technicalDebtGrowth: 0,
              refactorPriority: []
            },
            optimizationHints: {
              hints: [],
              priority: ''
            },
            securityScore: 0,
            performanceScore: 0,
            maintainabilityScore: 0
          };
        } else {
          throw new Error('API not available');
        }
      } catch (apiError) {
        // Fallback to local analyzer
        const mockFile = {
          path: 'input.ts',
          content: code,
          name: 'input.ts',
          type: 'file' as const,
          sha: 'mock-sha',
          size: code.length
        };
        
        analysisResult = await enhancedCodeAnalyzer.analyzeFilesStreaming([mockFile]);
      }
      
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      className={`code-review-widget ${defaultConfig.theme === 'dark' ? 'dark' : ''}`}
      style={{ height: defaultConfig.height, width: defaultConfig.width }}
    >
      {defaultConfig.showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Code Review Assistant
          </CardTitle>
          <CardDescription>
            Get instant AI-powered code analysis and suggestions
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code-input">Paste your code here:</Label>
          <textarea
            id="code-input"
            className="w-full h-32 p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="function example() { ... }"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !code.trim()}
          className="w-full"
          style={{ backgroundColor: defaultConfig.primaryColor }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Analyze Code
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Overall Score:</span>
              <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}/100
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Issues Found:</h4>
              {result.issues.map((issue, index) => (
                <div key={index} className={`p-3 border rounded-lg ${getSeverityColor(issue.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{issue.title}</p>
                      <p className="text-xs mt-1 opacity-75">
                        Line {issue.line} • {issue.category}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {issue.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Suggestions:</h4>
              {result.recommendations.map((suggestion, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}

// Widget initialization function for external embedding
window.CodeReviewWidget = {
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

declare global {
  interface Window {
    CodeReviewWidget: {
      init: (elementId: string, config?: WidgetConfig) => void;
    };
  }
}

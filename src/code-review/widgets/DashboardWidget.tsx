import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@code-review/components/ui/card';
import { Button } from '@code-review/components/ui/button';
import { Badge } from '@code-review/components/ui/badge';
import { 
  TrendingUp,
  TrendingDown,
  FileWarning,
  AlertTriangle,
  CheckCircle2,
  Activity,
  BarChart3,
  GitBranch,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Review, ReviewCategory, categoryLabels, categoryIcons } from '@code-review/lib/types';

interface WidgetConfig {
  theme?: 'light' | 'dark';
  showHeader?: boolean;
  height?: string;
  width?: string;
  refreshInterval?: number;
}

interface DashboardWidgetProps {
  config?: WidgetConfig;
  data?: Review[];
  onRefresh?: () => void;
}

export default function DashboardWidget({ 
  config = {},
  data = [],
  onRefresh
}: DashboardWidgetProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(false);

  const defaultConfig: Required<WidgetConfig> = {
    theme: 'light',
    showHeader: true,
    height: '400px',
    width: '100%',
    refreshInterval: 30000,
    ...config
  };

  // Mock data for demonstration
  const mockData: Review[] = data.length > 0 ? data : [
    {
      id: '1',
      name: 'frontend-app',
      source: 'github',
      repoUrl: 'https://github.com/example/frontend-app',
      score: 85,
      totalIssues: 12,
      critical: 1,
      warnings: 4,
      improvements: 7,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      categories: {
        architecture: 88,
        'code-quality': 82,
        performance: 90,
        'state-management': 85,
        security: 78,
        'error-handling': 86,
        scalability: 84,
      },
      issues: []
    },
    {
      id: '2',
      name: 'backend-api',
      source: 'github',
      repoUrl: 'https://github.com/example/backend-api',
      score: 72,
      totalIssues: 28,
      critical: 3,
      warnings: 10,
      improvements: 15,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      categories: {
        architecture: 75,
        'code-quality': 68,
        performance: 70,
        'state-management': 74,
        security: 65,
        'error-handling': 78,
        scalability: 72,
      },
      issues: []
    }
  ];

  const avgScore = Math.round(
    mockData.reduce((acc, review) => acc + review.score, 0) / mockData.length
  );

  const totalIssues = mockData.reduce((acc, review) => acc + review.totalIssues, 0);
  const criticalIssues = mockData.reduce((acc, review) => acc + review.critical, 0);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await onRefresh?.();
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div 
      className={`dashboard-widget ${defaultConfig.theme === 'dark' ? 'dark' : ''}`}
      style={{ height: defaultConfig.height, width: defaultConfig.width }}
    >
      {defaultConfig.showHeader && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Code Health Dashboard
            </CardTitle>
            <CardDescription>
              Monitor your codebase quality over time
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Activity className="h-4 w-4 animate-spin" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
      )}

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                    {avgScore}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon('up')}
                  <span className="text-sm text-green-600">+5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold">{totalIssues}</p>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon('down')}
                  <span className="text-sm text-green-600">-12%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-600">{criticalIssues}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Reviews</h3>
          <div className="flex gap-1">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days'}
              </Button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {mockData.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="transition-colors hover:border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{review.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {review.source}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-center">
                          <p className={`text-lg font-bold ${getScoreColor(review.score)}`}>
                            {review.score}
                          </p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{review.totalIssues}</p>
                          <p className="text-xs text-muted-foreground">Issues</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-red-600">{review.critical}</p>
                          <p className="text-xs text-muted-foreground">Critical</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-yellow-600">{review.warnings}</p>
                          <p className="text-xs text-muted-foreground">Warnings</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {Object.entries(review.categories).map(([category, score]) => (
                          <div
                            key={category}
                            className="flex items-center gap-1 px-2 py-1 bg-accent rounded text-xs"
                          >
                            <span>{categoryIcons[category as ReviewCategory]}</span>
                            <span>{score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Category Overview */}
        <div className="space-y-3">
          <h3 className="font-semibold">Category Performance</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(categoryLabels).map(([category, label]) => {
              const categoryScores = mockData.map(r => r.categories[category as ReviewCategory]);
              const avgCategoryScore = Math.round(
                categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length
              );
              
              return (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{categoryIcons[category as ReviewCategory]}</span>
                    <span className="text-sm">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          avgCategoryScore >= 80 ? 'bg-green-600' :
                          avgCategoryScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${avgCategoryScore}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(avgCategoryScore)}`}>
                      {avgCategoryScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </div>
  );
}

// Widget initialization
window.DashboardWidget = {
  init: (elementId: string, config?: WidgetConfig) => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id '${elementId}' not found`);
      return;
    }
    console.log('Initializing Dashboard Widget with config:', config);
  }
};

declare global {
  interface Window {
    DashboardWidget: {
      init: (elementId: string, config?: WidgetConfig) => void;
    };
  }
}

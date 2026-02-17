import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@code-review/components/ui/card";
import { Badge } from "@code-review/components/ui/badge";
import { Button } from "@code-review/components/ui/button";
import { AlertCircle, CheckCircle2, XCircle, Clock, Webhook } from "lucide-react";
import { WebhookService, type WebhookPayload } from "@code-review/lib/webhooks";

interface WebhookEvent {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  received: string;
  status: 'pending' | 'success' | 'error';
}

export default function WebhookReceiver() {
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:8080');
  const [testMode, setTestMode] = useState(false);

  // Load webhooks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('webhooks');
      if (stored) {
        const parsed = JSON.parse(stored);
        setWebhooks(parsed);
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
    }
  }, []);

  // Save webhooks to localStorage when they change
  useEffect(() => {
    if (webhooks.length > 0) {
      localStorage.setItem('webhooks', JSON.stringify(webhooks));
    }
  }, [webhooks]);

  // Add webhook event
  const addWebhookEvent = (event: string, data: any, status: 'success') => {
    const newEvent: WebhookEvent = {
      id: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event,
      data,
      timestamp: new Date().toISOString(),
      received: new Date().toISOString(),
      status,
    };
    
    setWebhooks(prev => [newEvent, ...prev.slice(0, 49)]); // Keep only last 50 events
  };

  // Test webhook functionality
  const testWebhook = async () => {
    setTestMode(true);
    
    // Simulate different webhook events
    const testEvents = [
      { event: 'analysis_started', data: { repoUrl: 'https://github.com/test/repo' } },
      { event: 'analysis_complete', data: { reviewId: 'test-123', score: 85, totalIssues: 5 } },
      { event: 'review_created', data: { reviewId: 'test-123', score: 85 } },
      { event: 'analysis_failed', data: { error: 'Test error message' } },
    ];
    
    for (const testEvent of testEvents) {
      addWebhookEvent(testEvent.event, testEvent.data, 'success');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between events
    }
    
    setTestMode(false);
  };

  // Clear all webhooks
  const clearWebhooks = () => {
    setWebhooks([]);
    localStorage.removeItem('webhooks');
  };

  // Retry failed webhooks
  const retryFailedWebhooks = async () => {
    const failedWebhooks = webhooks.filter(w => w.status === 'error');
    
    for (const webhook of failedWebhooks) {
      try {
        await WebhookService.sendWebhook(webhookUrl, {
          event: webhook.event,
          data: webhook.data,
          timestamp: webhook.timestamp,
        });
        
        // Update status to success
        setWebhooks(prev => 
          prev.map(w => 
            w.id === webhook.id ? { ...w, status: 'success' } : w
          )
        );
      } catch (error) {
        console.error('Failed to retry webhook:', error);
      }
    }
  };

  // Get event icon based on event type
  const getEventIcon = (event: string) => {
    switch (event) {
      case 'analysis_started':
        return <Clock className="h-4 w-4" />;
      case 'analysis_complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'analysis_failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'review_created':
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      default:
        return <Webhook className="h-4 w-4" />;
    }
  };

  // Get event color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">📡 Webhook Receiver</h2>
        <div className="flex gap-2">
          <Badge 
            variant={isListening ? "default" : "secondary"}
            className={isListening ? "bg-green-500 text-white" : ""}
          >
            {isListening ? "Listening" : "Paused"}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsListening(!isListening)}
          >
            {isListening ? "Pause" : "Resume"}
          </Button>
        </div>
      </div>

      {/* Webhook Configuration */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="webhook-url" className="text-sm font-medium">
              Webhook URL
            </label>
            <div className="mt-1.5 p-3 bg-secondary/20 rounded-md font-mono text-sm flex items-center justify-between">
              <span>{webhookUrl}</span>
              <Badge variant="secondary" className="text-xs">
                Auto-registered
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This URL is automatically configured to receive webhook events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testWebhook}
              disabled={testMode}
            >
              {testMode ? "Testing..." : "Test Webhook"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearWebhooks}
            >
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={retryFailedWebhooks}
              disabled={!webhooks.some(w => w.status === 'error')}
            >
              Retry Failed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Events */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Recent Events</CardTitle>
          <CardDescription>
            {webhooks.length > 0 
              ? `Last ${webhooks.length} events received` 
              : 'No webhook events received yet'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No webhook events received yet</p>
              <p className="text-sm">
                Start an analysis in Code Guardian to see webhook events here
              </p>
            </div>
          ) : (
            webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="rounded-lg border border-border/50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getEventIcon(webhook.event)}
                    <span className="font-semibold text-sm">
                      {webhook.event.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <Badge 
                    className={`${getStatusColor(webhook.status)} text-xs`}
                  >
                    {webhook.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(webhook.timestamp).toLocaleString()}
                </div>
                <div className="bg-secondary/20 rounded-md p-3">
                  <pre className="text-xs text-code-foreground overflow-x-auto">
                    {JSON.stringify(webhook.data, null, 2)}
                  </pre>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">How Webhooks Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Auto-Registered:</h4>
            <p>Your webhook URL is automatically configured when you start Code Guardian.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">2. Start Analysis:</h4>
            <p>Begin a code analysis to trigger real-time webhook events.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">3. Watch Events:</h4>
            <p>Webhook events appear here automatically as analyses progress.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">4. Integration Ready:</h4>
            <p>Use these events to trigger notifications or integrate with other services.</p>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Examples */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Webhook Payload Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Analysis Started:</h4>
            <pre className="text-xs bg-secondary/20 rounded-md p-3 overflow-x-auto">
{`{
  "event": "analysis_started",
  "data": {
    "repoUrl": "https://github.com/user/repo",
    "timestamp": "2026-02-16T22:04:00Z"
  },
  "timestamp": "2026-02-16T22:04:00Z"
}`}</pre>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Analysis Complete:</h4>
            <pre className="text-xs bg-secondary/20 rounded-md p-3 overflow-x-auto">
{`{
  "event": "analysis_complete",
  "data": {
    "reviewId": "rev-123456",
    "reviewName": "user/repo",
    "repoUrl": "https://github.com/user/repo",
    "score": 78,
    "totalIssues": 12,
    "categories": {
      "security": 85,
      "performance": 72,
      "code-quality": 80
    }
  },
  "timestamp": "2026-02-16T22:04:00Z"
}`}</pre>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Review Created:</h4>
            <pre className="text-xs bg-secondary/20 rounded-md p-3 overflow-x-auto">
{`{
  "event": "review_created",
  "data": {
    "reviewId": "rev-123456",
    "reviewName": "user/repo",
    "score": 78,
    "totalIssues": 12,
    "categories": {
      "security": 85,
      "event": "performance": 72,
      "code-quality": 80
    }
  },
  "timestamp": "2026-02-16T22:04:00Z"
}`}</pre>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Analysis Failed:</h4>
            <pre className="text-xs bg-secondary/20 rounded-md p-3 overflow-x-auto">
{`{
  "event": "analysis_failed",
  "data": {
    "error": "Invalid GitHub repository URL",
    "timestamp": "2026-02-16T22:04:00Z"
  },
  "timestamp": "2026-02-16T22:04:00Z"
}`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
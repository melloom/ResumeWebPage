import { useState, useCallback, useRef, useEffect } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Code2,
  Webhook,
  Check,
  Copy,
  CheckCheck,
  Sliders,
  Paintbrush,
  Key,
  Shield,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  RefreshCw,
  FileText,
  Database,
  Clock,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@code-review/components/ui/card";
import { Button } from "@code-review/components/ui/button";
import { Label } from "@code-review/components/ui/label";
import { Switch } from "@code-review/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@code-review/components/ui/tabs";
import { Slider } from "@code-review/components/ui/slider";
import { Checkbox } from "@code-review/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@code-review/components/ui/select";
import { Textarea } from "@code-review/components/ui/textarea";
import { Input } from "@code-review/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@code-review/components/ui/dialog";
import { useTheme } from "@code-review/components/ThemeProvider";
import { useToast } from "@code-review/hooks/use-toast";
import { dataManager, DataRetentionSettings } from "@code-review/lib/data-manager";
import { getCurrentUser, signOutUser } from "@code-review/lib/firebase";
import { Timestamp, serverTimestamp } from "firebase/firestore";
import GitHubConnect from "@code-review/components/GitHubConnect";
import { generateApiKey, getUserApiKeys, deleteApiKey, updateUserProfile, getUserWebhookUrl, generateWebhookUrl } from "@code-review/lib/user-store";
import { Edit, Eye, EyeOff } from "lucide-react";

const RULES_STORAGE_KEY = "codereview-rules";
const NOTIFICATIONS_STORAGE_KEY = "codereview-notifications";
const ANALYSIS_STORAGE_KEY = "codereview-analysis";
const CODESTYLE_STORAGE_KEY = "codereview-codestyle";
const APIWIDGET_STORAGE_KEY = "codereview-apiwidget";
const DATA_STORAGE_KEY = "codereview-data";

const DEFAULT_RULES = [
  { id: "no-any", label: "Disallow `any` type usage", enabled: true },
  { id: "max-file-lines", label: "Max file length (500 lines)", enabled: true },
  { id: "require-error-boundary", label: "Require error boundaries", enabled: false },
  { id: "no-inline-styles", label: "Disallow inline styles", enabled: true },
  { id: "require-tests", label: "Require test coverage > 60%", enabled: false },
  { id: "no-console", label: "No console.log in production", enabled: true },
];

const DEFAULT_NOTIFICATIONS = {
  email: true,
  inApp: true,
  criticalOnly: false,
};

const DEFAULT_ANALYSIS = {
  severityThreshold: "all" as string,
  maxFileSize: 1000,
  analysisTimeout: 30,
  languages: ["typescript", "javascript"] as string[],
  complexityThreshold: 15,
  duplicateDetection: true,
  securityScanning: true,
  performanceAnalysis: true,
};

const ALL_LANGUAGES = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
];

type IndentationType = 'tabs' | 'spaces';
type IndentSizeType = '2' | '4' | '8';
type MaxLineLengthType = '80' | '100' | '120' | 'custom';
type NamingConventionType = 'camelCase' | 'snake_case' | 'PascalCase';
type SemicolonsType = 'always' | 'never';
type QuoteStyleType = 'single' | 'double';
type TrailingCommasType = 'none' | 'es5' | 'all';

interface CodeStyleSettings {
  indentation: IndentationType;
  indentSize: IndentSizeType;
  maxLineLength: MaxLineLengthType;
  customMaxLineLength: string;
  namingConvention: NamingConventionType;
  semicolons: SemicolonsType;
  quoteStyle: QuoteStyleType;
  trailingCommas: TrailingCommasType;
}

const DEFAULT_CODESTYLE: CodeStyleSettings = {
  indentation: 'spaces',
  indentSize: '2',
  maxLineLength: '100',
  customMaxLineLength: '',
  namingConvention: 'camelCase',
  semicolons: 'always',
  quoteStyle: 'single',
  trailingCommas: 'es5',
};

const DEFAULT_APIWIDGET = {
  apiKey: "" as string,
  allowedDomains: "" as string,
  widgetTheme: "inherit" as string,
  widgetPosition: "bottom-right" as string,
  callbackUrl: "" as string,
};

const DEFAULT_DATA = {
  dataRetention: "30d" as string,
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [isGeneratingWebhook, setIsGeneratingWebhook] = useState(false);
  const [savedApiKeys, setSavedApiKeys] = useState<Array<{ key: string; name: string; createdAt: Timestamp; lastUsed?: Timestamp; usageCount?: number }>>([]);
  const [editingApiKey, setEditingApiKey] = useState<string | null>(null);
  const [editingApiName, setEditingApiName] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<{ [key: string ]: boolean }>({});
  const [retentionSettings, setRetentionSettings] = useState<DataRetentionSettings>(() =>
    dataManager.getDataRetentionSettings()
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [clearReviewsDialogOpen, setClearReviewsDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState(getCurrentUser());

  // Fetch webhook URL when user is authenticated
  useEffect(() => {
    if (user) {
      setIsGeneratingWebhook(true);
      getUserWebhookUrl().then(async (url) => {
        if (!url) {
          // Generate a unique webhook URL if user doesn't have one
          try {
            const newUrl = await generateWebhookUrl();
            setWebhookUrl(newUrl);
            console.log('Generated new webhook URL:', newUrl);
          } catch (error) {
            console.error('Error generating webhook URL:', error);
            setWebhookUrl(null);
          }
        } else {
          setWebhookUrl(url);
        }
      }).catch(error => {
        console.error('Error fetching webhook URL:', error);
      }).finally(() => {
        setIsGeneratingWebhook(false);
      });
    }
  }, [user]);

  // Fetch saved API keys when user is authenticated
  useEffect(() => {
    if (user) {
      getUserApiKeys().then(keys => {
        setSavedApiKeys(keys);
        // Initialize showApiKey state for each key
        const initialShowState: { [key: string ]: boolean } = {};
        keys.forEach(key => {
          initialShowState[key.key] = false;
        });
        setShowApiKey(initialShowState);
      }).catch(error => {
        console.error('Error fetching API keys:', error);
      });
    }
  }, [user]);

  const [rules, setRules] = useState(() =>
    loadFromStorage(RULES_STORAGE_KEY, DEFAULT_RULES)
  );

  const [notifications, setNotifications] = useState(() =>
    loadFromStorage(NOTIFICATIONS_STORAGE_KEY, DEFAULT_NOTIFICATIONS)
  );

  const [analysis, setAnalysis] = useState(() =>
    loadFromStorage(ANALYSIS_STORAGE_KEY, DEFAULT_ANALYSIS)
  );

  const [codeStyle, setCodeStyle] = useState(() =>
    loadFromStorage(CODESTYLE_STORAGE_KEY, DEFAULT_CODESTYLE)
  );

  const [apiWidget, setApiWidget] = useState(() =>
    loadFromStorage(APIWIDGET_STORAGE_KEY, DEFAULT_APIWIDGET)
  );

  const [dataSettings, setDataSettings] = useState(() =>
    loadFromStorage(DATA_STORAGE_KEY, DEFAULT_DATA)
  );

  const handleRuleToggle = useCallback(
    (ruleId: string, checked: boolean) => {
      setRules((prev) => {
        const updated = prev.map((r) =>
          r.id === ruleId ? { ...r, enabled: checked } : r
        );
        localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const handleNotificationChange = useCallback(
    (key: keyof typeof DEFAULT_NOTIFICATIONS, checked: boolean) => {
      setNotifications((prev) => {
        const updated = { ...prev, [key]: checked };
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const handleCopyWebhook = useCallback(() => {
    const url = webhookUrl || 'https://api.codereview.ai/webhook/abc123';
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast({ title: "Copied!", description: "Webhook URL copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    });
  }, [webhookUrl, toast]);

  const updateAnalysis = useCallback(
    <K extends keyof typeof DEFAULT_ANALYSIS>(key: K, value: typeof DEFAULT_ANALYSIS[K]) => {
      setAnalysis((prev) => {
        const updated = { ...prev, [key]: value };
        localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const updateCodeStyle = useCallback(
    <K extends keyof CodeStyleSettings>(key: K, value: CodeStyleSettings[K]) => {
      setCodeStyle((prev) => {
        const updated = { ...prev, [key]: value };
        localStorage.setItem(CODESTYLE_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const updateApiWidget = useCallback(
    <K extends keyof typeof DEFAULT_APIWIDGET>(key: K, value: typeof DEFAULT_APIWIDGET[K]) => {
      setApiWidget((prev) => {
        const updated = { ...prev, [key]: value };
        localStorage.setItem(APIWIDGET_STORAGE_KEY, JSON.stringify(updated));
        
        // Also update in Firebase if user is authenticated
        const user = getCurrentUser();
        if (user) {
          updateUserProfile({
            apiKeys: prev.apiKey ? [{
              key: prev.apiKey,
              name: 'Default',
              createdAt: serverTimestamp() as Timestamp,
              usageCount: 0
            }] : []
          });
        }
        
        return updated;
      });
    },
    []
  );

  const updateDataSettings = useCallback(
    <K extends keyof typeof DEFAULT_DATA>(key: K, value: typeof DEFAULT_DATA[K]) => {
      setDataSettings((prev) => {
        const updated = { ...prev, [key]: value };
        localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const handleGenerateApiKey = useCallback(async () => {
    try {
      // If there's already an API key, ask if user wants to replace it
      if (apiWidget.apiKey) {
        const shouldReplace = window.confirm(
          "You already have an API key. Do you want to generate a new one? This will replace your current key."
        );
        if (!shouldReplace) return;
      }
      
      const key = await generateApiKey('Default API Key');
      updateApiWidget("apiKey", key);
      toast({ title: "API Key Generated", description: "New API key has been created and stored in your profile." });
    } catch (error) {
      toast({ 
        title: "Failed to Generate API Key", 
        description: "Please ensure you're logged in.", 
        variant: "destructive" 
      });
    }
  }, [updateApiWidget, toast, apiWidget.apiKey]);

  const handleCopyApiKey = useCallback(() => {
    navigator.clipboard.writeText(apiWidget.apiKey).then(() => {
      setApiKeyCopied(true);
      toast({ title: "Copied!", description: "API key copied to clipboard." });
      setTimeout(() => setApiKeyCopied(false), 2000);
    });
  }, [apiWidget.apiKey, toast]);

  const handleCopySnippet = useCallback(() => {
    const snippet = `<script src="https://cdn.codeguardian.dev/widget.js"></script>\n<script>\n  CodeGuardian.init({\n    apiKey: "${apiWidget.apiKey || "YOUR_API_KEY"}",\n    theme: "${apiWidget.widgetTheme}",\n    position: "${apiWidget.widgetPosition}"\n  });\n</script>`;
    navigator.clipboard.writeText(snippet).then(() => {
      setSnippetCopied(true);
      toast({ title: "Copied!", description: "Embed snippet copied to clipboard." });
      setTimeout(() => setSnippetCopied(false), 2000);
    });
  }, [apiWidget, toast]);

  const handleToggleLanguage = useCallback(
    (langId: string, checked: boolean) => {
      setAnalysis((prev) => {
        const langs = checked
          ? [...prev.languages, langId]
          : prev.languages.filter((l) => l !== langId);
        const updated = { ...prev, languages: langs };
        localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  // Data management functions
  const handleExportData = useCallback(async () => {
    setIsExporting(true);
    try {
      const exportData = await dataManager.exportUserData();
      dataManager.downloadExportData(exportData);
      toast({ 
        title: "Export Successful", 
        description: "Your data has been exported successfully." 
      });
    } catch (error) {
      toast({ 
        title: "Export Failed", 
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  const handleImportData = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    
    try {
      const importData = await dataManager.parseImportFile(file);
      await dataManager.importUserData(importData);
      
      // Refresh state
      setRules(loadFromStorage(RULES_STORAGE_KEY, DEFAULT_RULES));
      setNotifications(loadFromStorage(NOTIFICATIONS_STORAGE_KEY, DEFAULT_NOTIFICATIONS));
      setAnalysis(loadFromStorage(ANALYSIS_STORAGE_KEY, DEFAULT_ANALYSIS));
      setCodeStyle(loadFromStorage(CODESTYLE_STORAGE_KEY, DEFAULT_CODESTYLE));
      setApiWidget(loadFromStorage(APIWIDGET_STORAGE_KEY, DEFAULT_APIWIDGET));
      setDataSettings(loadFromStorage(DATA_STORAGE_KEY, DEFAULT_DATA));
      setRetentionSettings(dataManager.getDataRetentionSettings());
      
      toast({ 
        title: "Import Successful", 
        description: `Imported ${importData.reviews.length} reviews and settings.` 
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Failed to import data");
      toast({ 
        title: "Import Failed", 
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      // Clear the file input
      e.target.value = '';
    }
  }, [toast]);

  const handleClearAllData = useCallback(async () => {
    try {
      await dataManager.clearAllData();
      toast({ 
        title: "Data Cleared", 
        description: "All your data has been permanently deleted." 
      });
      setClearAllDialogOpen(false);
      // Reset all state to defaults
      setRules(DEFAULT_RULES);
      setNotifications(DEFAULT_NOTIFICATIONS);
      setAnalysis(DEFAULT_ANALYSIS);
      setCodeStyle(DEFAULT_CODESTYLE);
      setApiWidget(DEFAULT_APIWIDGET);
      setDataSettings(DEFAULT_DATA);
      setRetentionSettings(dataManager.getDataRetentionSettings());
    } catch (error) {
      toast({ 
        title: "Clear Failed", 
        description: error instanceof Error ? error.message : "Failed to clear data",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleClearReviewDataOnly = useCallback(async () => {
    try {
      await dataManager.clearReviewData();
      toast({ 
        title: "Review Data Cleared", 
        description: "All review data has been permanently deleted." 
      });
      setClearReviewsDialogOpen(false);
    } catch (error) {
      toast({ 
        title: "Clear Failed", 
        description: error instanceof Error ? error.message : "Failed to clear review data",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleResetToDefaults = useCallback(() => {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(DEFAULT_RULES));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(DEFAULT_ANALYSIS));
    localStorage.setItem(CODESTYLE_STORAGE_KEY, JSON.stringify(DEFAULT_CODESTYLE));
    localStorage.setItem(APIWIDGET_STORAGE_KEY, JSON.stringify(DEFAULT_APIWIDGET));
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    setRules(DEFAULT_RULES);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setAnalysis(DEFAULT_ANALYSIS);
    setCodeStyle(DEFAULT_CODESTYLE);
    setApiWidget(DEFAULT_APIWIDGET);
    setDataSettings(DEFAULT_DATA);
    setResetDialogOpen(false);
    toast({ title: "Reset", description: "All settings restored to defaults." });
  }, [toast]);

  const updateRetentionSettings = useCallback(<K extends keyof DataRetentionSettings>(
    key: K, 
    value: DataRetentionSettings[K]
  ) => {
    const updated = { ...retentionSettings, [key]: value };
    setRetentionSettings(updated);
    dataManager.updateDataRetentionSettings(updated);
  }, [retentionSettings]);

  const handleRunCleanup = useCallback(async () => {
    try {
      await dataManager.performDataCleanup();
      toast({ 
        title: "Cleanup Complete", 
        description: "Old data has been cleaned up according to your retention policy." 
      });
    } catch (error) {
      toast({ 
        title: "Cleanup Failed", 
        description: "Failed to perform data cleanup",
        variant: "destructive"
      });
    }
  }, [toast]);

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  const embedSnippet = `<!-- Direct Embed Method -->
<script src="https://your-domain.com/widget.js"></script>
<script>
  CodeReviewWidget.init('code-review-widget', {
    apiKey: "${apiWidget.apiKey || "YOUR_API_KEY"}",
    theme: "${apiWidget.widgetTheme}",
    position: "${apiWidget.widgetPosition}"
  });
</script>`;

const integrationOptions = {
  direct: {
    title: "Direct Script Embed",
    description: "Embed the widget directly on your page",
    code: `<!DOCTYPE html>
<html>
<head>
    <title>Code Review Widget</title>
    <script src="https://your-domain.com/widget.js"></script>
</head>
<body>
    <div id="code-review-widget"></div>
    <script>
        CodeReviewWidget.init('code-review-widget', {
            apiKey: "${apiWidget.apiKey || "YOUR_API_KEY"}",
            theme: "${apiWidget.widgetTheme}",
            position: "${apiWidget.widgetPosition}"
        });
    </script>
</body>
</html>`
  },
  iframe: {
    title: "iFrame Embed",
    description: "Embed using an iframe for full isolation",
    code: `<iframe 
    src="https://your-domain.com/widget.html?apiKey=${apiWidget.apiKey || "YOUR_API_KEY"}&theme=${apiWidget.widgetTheme}" 
    width="100%" 
    height="600"
    frameborder="0"
    style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
></iframe>`
  },
  react: {
    title: "React Component",
    description: "Use as a React component in your app",
    code: `import { CodeReviewWidget } from '@codeguardian/widget';

function App() {
    return (
        <CodeReviewWidget 
            config={{
                apiKey: "${apiWidget.apiKey || "YOUR_API_KEY"}",
                theme: "${apiWidget.widgetTheme}",
                position: "${apiWidget.widgetPosition}",
                onAnalysisComplete: (result) => {
                    console.log('Analysis result:', result);
                }
            }}
        />
    );
}`
  },
  vue: {
    title: "Vue Component",
    description: "Use as a Vue component",
    code: `<template>
    <div>
        <CodeReviewWidget 
            :config="widgetConfig"
            @analysis-complete="handleAnalysis"
        />
    </div>
</template>

<script>
import { CodeReviewWidget } from '@codeguardian/widget';

export default {
    components: { CodeReviewWidget },
    data() {
        return {
            widgetConfig: {
                apiKey: "${apiWidget.apiKey || "YOUR_API_KEY"}",
                theme: "${apiWidget.widgetTheme}",
                position: "${apiWidget.widgetPosition}"
            }
        };
    },
    methods: {
        handleAnalysis(result) {
            console.log('Analysis result:', result);
        }
    }
};
</script>`
  },
  angular: {
    title: "Angular Component",
    description: "Use as an Angular component",
    code: `import { Component } from '@angular/core';
import { CodeReviewWidgetModule } from '@codeguardian/widget';

@Component({
    selector: 'app-code-review',
    template: \`
        <code-review-widget 
            [config]="widgetConfig"
            (analysisComplete)="onAnalysisComplete($event)">
        </code-review-widget>
    \`
})
export class CodeReviewComponent {
    widgetConfig = {
        apiKey: "${apiWidget.apiKey || "YOUR_API_KEY"}",
        theme: "${apiWidget.widgetTheme}",
        position: "${apiWidget.widgetPosition}"
    };

    onAnalysisComplete(result: any) {
        console.log('Analysis result:', result);
    }
}`
  },
  api: {
    title: "Direct API Integration",
    description: "Call the API directly without the widget",
    code: `// JavaScript/TypeScript
async function analyzeCode(code) {
    const response = await fetch('https://your-domain.com/.netlify/functions/analyze-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ${apiWidget.apiKey || "YOUR_API_KEY"}'
        },
        body: JSON.stringify({
            code: code,
            language: 'typescript'
        })
    });

    const result = await response.json();
    return result;
}

// Usage
const result = await analyzeCode('function example() { return true; }');
console.log('Score:', result.score);
console.log('Issues:', result.issues);`
  },
  python: {
    title: "Python Integration",
    description: "Use the API from Python",
    code: `import requests
import json

def analyze_code(code, api_key="${apiWidget.apiKey || 'YOUR_API_KEY'}"):
    url = "https://your-domain.com/.netlify/functions/analyze-code"
    
    payload = {
        "code": code,
        "language": "python"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    result = response.json()
    
    return result

# Usage
code = "def example():\\n    return True"
result = analyze_code(code)
print(f"Score: {result['score']}")
print(f"Issues: {len(result['issues'])}")`
  },
  webhook: {
    title: "Webhook Integration",
    description: "Receive analysis results via webhook",
    code: `// Express.js webhook endpoint
app.post('/webhook/code-analysis', (req, res) => {
    const { analysisId, result, timestamp } = req.body;
    
    // Verify webhook signature if needed
    const signature = req.headers['x-codeguard-signature'];
    const isValid = verifySignature(signature, JSON.stringify(req.body));
    
    if (!isValid) {
        return res.status(401).send('Invalid signature');
    }
    
    // Process the analysis result
    console.log('Analysis completed:', {
        id: analysisId,
        score: result.score,
        issues: result.issues.length,
        timestamp: new Date(timestamp)
    });
    
    // Store in database, send notifications, etc.
    
    res.status(200).send('Webhook received');
});`
  }
};

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="theme">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="rules">Custom Rules</TabsTrigger>
          <TabsTrigger value="cicd">CI/CD</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analysis" className="gap-1">
            <Sliders className="h-3.5 w-3.5" /> Analysis
          </TabsTrigger>
          <TabsTrigger value="codestyle" className="gap-1">
            <Paintbrush className="h-3.5 w-3.5" /> Code Style
          </TabsTrigger>
          <TabsTrigger value="apiwidget" className="gap-1">
            <Key className="h-3.5 w-3.5" /> API & Widget
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1">
            <Shield className="h-3.5 w-3.5" /> Data & Privacy
          </TabsTrigger>
        </TabsList>

        {/* ── Theme ── */}
        <TabsContent value="theme" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Theme Preferences</CardTitle>
              <CardDescription>
                Choose your preferred appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-colors ${
                      theme === opt.value
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <opt.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{opt.label}</span>
                    {theme === opt.value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* GitHub Integration */}
          <GitHubConnect />

          {/* Sign Out */}
          {user && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">Account</CardTitle>
                <CardDescription>
                  Manage your signed-in account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.displayName || user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.providerData.map(p => p.providerId).join(', ')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await signOutUser();
                      window.location.href = '/login';
                    }}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Custom Rules ── */}
        <TabsContent value="rules" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Code2 className="h-4 w-4" /> Custom Rules
              </CardTitle>
              <CardDescription>
                Toggle specific lint and review rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5"
                >
                  <Label htmlFor={rule.id} className="cursor-pointer text-sm font-normal">
                    <code className="font-mono text-xs text-primary">{rule.id}</code>
                    <span className="ml-2">{rule.label}</span>
                  </Label>
                  <Switch
                    id={rule.id}
                    checked={rule.enabled}
                    onCheckedChange={(checked) => handleRuleToggle(rule.id, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CI/CD ── */}
        <TabsContent value="cicd" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Webhook className="h-4 w-4" /> CI/CD Integration
              </CardTitle>
              <CardDescription>
                Integrate CodeReview into your pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Your Unique Webhook URL</Label>
                <div className="mt-1.5 flex gap-2">
                  <code className="flex-1 rounded-md border border-border bg-code-bg px-3 py-2 font-mono text-sm text-code-foreground">
                    {isGeneratingWebhook ? (
                      <span className="text-muted-foreground">Generating unique URL...</span>
                    ) : webhookUrl ? (
                      webhookUrl
                    ) : (
                      'https://api.codereview.ai/webhook/abc123'
                    )}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopyWebhook} disabled={isGeneratingWebhook}>
                    {copied ? (
                      <><CheckCheck className="mr-1 h-3.5 w-3.5" /> Copied</>
                    ) : (
                      <><Copy className="mr-1 h-3.5 w-3.5" /> Copy</>
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {isGeneratingWebhook 
                    ? "Creating your unique webhook endpoint..."
                    : webhookUrl 
                      ? "This unique URL is tied to your account. Use it in your CI/CD pipeline with your API key in the Authorization header."
                      : "Use this URL in your CI/CD pipeline. Include your API key in the Authorization header."
                  }
                </p>
              </div>
              <div className="rounded-lg bg-code-bg p-4">
                <p className="mb-2 text-sm font-medium">GitHub Actions Example</p>
                <pre className="overflow-x-auto font-mono text-xs text-code-foreground">
{`# .github/workflows/code-review.yml
name: AI Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run CodeReview
        run: |
          curl -X POST \\
            https://api.codereview.ai/webhook/abc123 \\
            -H "Authorization: Bearer \${{ secrets.CR_TOKEN }}" \\
            -d '{"repo": "\${{ github.repository }}"}'`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" /> Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "email" as const, label: "Email notifications" },
                { key: "inApp" as const, label: "In-app notifications" },
                { key: "criticalOnly" as const, label: "Critical issues only" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5"
                >
                  <Label className="cursor-pointer text-sm font-normal">
                    {item.label}
                  </Label>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) =>
                      handleNotificationChange(item.key, checked)
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Analysis Configuration ── */}
        <TabsContent value="analysis" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sliders className="h-4 w-4" /> Analysis Configuration
              </CardTitle>
              <CardDescription>
                Configure how code analysis is performed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Severity threshold */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Severity Threshold</Label>
                <Select
                  value={analysis.severityThreshold}
                  onValueChange={(v) => updateAnalysis("severityThreshold", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical only</SelectItem>
                    <SelectItem value="warnings">Warnings and above</SelectItem>
                    <SelectItem value="all">All issues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max file size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Max File Size</Label>
                  <span className="text-sm text-muted-foreground">{analysis.maxFileSize} lines</span>
                </div>
                <Slider
                  value={[analysis.maxFileSize]}
                  onValueChange={([v]) => updateAnalysis("maxFileSize", v)}
                  min={100}
                  max={10000}
                  step={100}
                />
              </div>

              {/* Analysis timeout */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Analysis Timeout</Label>
                  <span className="text-sm text-muted-foreground">{analysis.analysisTimeout}s</span>
                </div>
                <Slider
                  value={[analysis.analysisTimeout]}
                  onValueChange={([v]) => updateAnalysis("analysisTimeout", v)}
                  min={5}
                  max={120}
                  step={5}
                />
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Languages to Analyze</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_LANGUAGES.map((lang) => (
                    <div key={lang.id} className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2">
                      <Checkbox
                        id={`lang-${lang.id}`}
                        checked={analysis.languages.includes(lang.id)}
                        onCheckedChange={(checked) =>
                          handleToggleLanguage(lang.id, checked === true)
                        }
                      />
                      <Label htmlFor={`lang-${lang.id}`} className="cursor-pointer text-sm font-normal">
                        {lang.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complexity threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Complexity Threshold</Label>
                  <span className="text-sm text-muted-foreground">{analysis.complexityThreshold}</span>
                </div>
                <Slider
                  value={[analysis.complexityThreshold]}
                  onValueChange={([v]) => updateAnalysis("complexityThreshold", v)}
                  min={1}
                  max={50}
                  step={1}
                />
              </div>

              {/* Toggle switches */}
              <div className="space-y-3">
                {[
                  { key: "duplicateDetection" as const, label: "Duplicate Detection" },
                  { key: "securityScanning" as const, label: "Security Scanning" },
                  { key: "performanceAnalysis" as const, label: "Performance Analysis" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5"
                  >
                    <Label className="cursor-pointer text-sm font-normal">{item.label}</Label>
                    <Switch
                      checked={analysis[item.key] as boolean}
                      onCheckedChange={(checked) => updateAnalysis(item.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Code Style ── */}
        <TabsContent value="codestyle" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Paintbrush className="h-4 w-4" /> Code Style Preferences
              </CardTitle>
              <CardDescription>
                Define the coding conventions for your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Indentation */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Indentation</Label>
                  <Select value={codeStyle.indentation} onValueChange={(v: IndentationType) => updateCodeStyle("indentation", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tabs">Tabs</SelectItem>
                      <SelectItem value="spaces">Spaces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Indent size */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Indent Size</Label>
                  <Select value={codeStyle.indentSize} onValueChange={(v: IndentSizeType) => updateCodeStyle("indentSize", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max line length */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Max Line Length</Label>
                  <Select value={codeStyle.maxLineLength} onValueChange={(v: MaxLineLengthType) => updateCodeStyle("maxLineLength", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="80">80</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="120">120</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {codeStyle.maxLineLength === "custom" && (
                    <Input
                      type="number"
                      placeholder="Enter max length"
                      value={codeStyle.customMaxLineLength}
                      onChange={(e) => updateCodeStyle("customMaxLineLength", e.target.value)}
                      className="mt-1"
                    />
                  )}
                </div>

                {/* Naming convention */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Naming Convention</Label>
                  <Select value={codeStyle.namingConvention} onValueChange={(v: NamingConventionType) => updateCodeStyle("namingConvention", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camelCase">camelCase</SelectItem>
                      <SelectItem value="snake_case">snake_case</SelectItem>
                      <SelectItem value="PascalCase">PascalCase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Semicolons */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Semicolons</Label>
                  <Select value={codeStyle.semicolons} onValueChange={(v: SemicolonsType) => updateCodeStyle("semicolons", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quote style */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quote Style</Label>
                  <Select value={codeStyle.quoteStyle} onValueChange={(v: QuoteStyleType) => updateCodeStyle("quoteStyle", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single quotes</SelectItem>
                      <SelectItem value="double">Double quotes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Trailing commas */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Trailing Commas</Label>
                  <Select value={codeStyle.trailingCommas} onValueChange={(v: TrailingCommasType) => updateCodeStyle("trailingCommas", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="es5">ES5</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── API & Widget ── */}
        <TabsContent value="apiwidget" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Key className="h-4 w-4" /> API & Widget Configuration
              </CardTitle>
              <CardDescription>
                Manage your API key and embeddable widget settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* API Key */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={apiWidget.apiKey || ""}
                    onChange={(e) => updateApiWidget("apiKey", e.target.value)}
                    placeholder="Enter or generate an API key"
                    className="flex-1 font-mono text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={handleGenerateApiKey}>
                    <RefreshCw className="mr-1 h-3.5 w-3.5" /> Generate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyApiKey}
                    disabled={!apiWidget.apiKey}
                  >
                    {apiKeyCopied ? (
                      <><CheckCheck className="mr-1 h-3.5 w-3.5" /> Copied</>
                    ) : (
                      <><Copy className="mr-1 h-3.5 w-3.5" /> Copy</>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generate a new key or enter your existing API key
                </p>
              </div>

              {/* Widget Settings */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Widget Settings</Label>
                
                {/* Allowed domains */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Allowed Domains</Label>
                  <Textarea
                    placeholder="example.com&#10;*.mysite.dev&#10;localhost"
                    value={apiWidget.allowedDomains}
                    onChange={(e) => updateApiWidget("allowedDomains", e.target.value)}
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">One domain per line. Leave empty to allow all.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Widget theme */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Widget Theme Override</Label>
                    <Select value={apiWidget.widgetTheme} onValueChange={(v) => updateApiWidget("widgetTheme", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">Inherit from site</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Widget position */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Widget Position</Label>
                    <Select value={apiWidget.widgetPosition} onValueChange={(v) => updateApiWidget("widgetPosition", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="inline">Inline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Callback URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Callback URL</Label>
                  <Input
                    placeholder="https://your-server.com/webhook"
                    value={apiWidget.callbackUrl}
                    onChange={(e) => updateApiWidget("callbackUrl", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Receives POST with analysis results when analysis completes.
                  </p>
                </div>
              </div>

              {/* Integration Options */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Integration Options</Label>
                <Tabs defaultValue="direct" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="direct">Widget</TabsTrigger>
                    <TabsTrigger value="api">API</TabsTrigger>
                    <TabsTrigger value="framework">Framework</TabsTrigger>
                    <TabsTrigger value="webhook">Webhook</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="direct" className="mt-4 space-y-4">
                    <div className="grid gap-4">
                      {Object.entries(integrationOptions).filter(([key]) => 
                        ['direct', 'iframe'].includes(key)
                      ).map(([key, option]) => (
                        <Card key={key} className="bg-muted/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{option.title}</CardTitle>
                            <CardDescription className="text-xs">
                              {option.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="relative">
                              <pre className="overflow-x-auto rounded-lg bg-code-bg p-4 font-mono text-xs text-code-foreground">
                                {option.code}
                              </pre>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => navigator.clipboard.writeText(option.code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="api" className="mt-4">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{integrationOptions.api.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {integrationOptions.api.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <pre className="overflow-x-auto rounded-lg bg-code-bg p-4 font-mono text-xs text-code-foreground">
                            {integrationOptions.api.code}
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => navigator.clipboard.writeText(integrationOptions.api.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="framework" className="mt-4 space-y-4">
                    <div className="grid gap-4">
                      {Object.entries(integrationOptions).filter(([key]) => 
                        ['react', 'vue', 'angular'].includes(key)
                      ).map(([key, option]) => (
                        <Card key={key} className="bg-muted/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{option.title}</CardTitle>
                            <CardDescription className="text-xs">
                              {option.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="relative">
                              <pre className="overflow-x-auto rounded-lg bg-code-bg p-4 font-mono text-xs text-code-foreground">
                                {option.code}
                              </pre>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => navigator.clipboard.writeText(option.code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="webhook" className="mt-4">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{integrationOptions.webhook.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {integrationOptions.webhook.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <pre className="overflow-x-auto rounded-lg bg-code-bg p-4 font-mono text-xs text-code-foreground">
                            {integrationOptions.webhook.code}
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => navigator.clipboard.writeText(integrationOptions.webhook.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Allowed domains */}
              </CardContent>
          </Card>
        </TabsContent>

        {/* ── Data & Privacy ── */}
        <TabsContent value="data" className="mt-4 space-y-4">
          {/* Data Management */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4" /> Data Management
              </CardTitle>
              <CardDescription>
                Export, import, or manage your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Export / Import */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Data Transfer</Label>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    disabled={isExporting}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Exporting..." : "Export All Data"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => importInputRef.current?.click()}
                    disabled={isImporting}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isImporting ? "Importing..." : "Import Data"}
                  </Button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportData}
                  />
                </div>
                {importError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    {importError}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Export includes all settings, reviews, and analysis data. Import will merge with existing data.
                </p>
              </div>

              {/* Data Retention */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Data Retention Policy</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Select 
                      value={retentionSettings.retentionPeriod} 
                      onValueChange={(v: '7d' | '30d' | '90d' | 'forever') => 
                        updateRetentionSettings('retentionPeriod', v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="90d">90 days</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-cleanup"
                      checked={retentionSettings.autoCleanup}
                      onCheckedChange={(checked) => 
                        updateRetentionSettings('autoCleanup', checked)
                      }
                    />
                    <Label htmlFor="auto-cleanup" className="text-sm">
                      Auto cleanup
                    </Label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Automatically remove old data based on retention period
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRunCleanup}
                  >
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    Run Cleanup Now
                  </Button>
                </div>
                {retentionSettings.lastCleanup && (
                  <p className="text-xs text-muted-foreground">
                    Last cleanup: {new Date(retentionSettings.lastCleanup).toLocaleString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="glass-card border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-destructive">
                <AlertTriangle className="h-4 w-4" /> Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that will permanently delete your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Clear Review Data */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Clear Review Data</Label>
                  <p className="text-xs text-muted-foreground">
                    Delete all review results and analysis data. Settings will be preserved.
                  </p>
                </div>
                <Dialog open={clearReviewsDialogOpen} onOpenChange={setClearReviewsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" /> Clear Reviews
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear Review Data</DialogTitle>
                      <DialogDescription>
                        This will permanently delete all saved review results and analysis data. 
                        Your settings and preferences will not be affected. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setClearReviewsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleClearReviewDataOnly}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear Review Data
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Clear All Data */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Clear All Data</Label>
                  <p className="text-xs text-muted-foreground">
                    Delete everything including reviews, settings, and preferences.
                  </p>
                </div>
                <Dialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" /> Clear All
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear All Data</DialogTitle>
                      <DialogDescription>
                        This will permanently delete ALL your data including reviews, settings, 
                        preferences, and cached information. The application will return to its 
                        initial state. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setClearAllDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleClearAllData}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear Everything
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Reset to Defaults */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Reset to Defaults</Label>
                  <p className="text-xs text-muted-foreground">
                    Reset all settings to their default values. Review data will be preserved.
                  </p>
                </div>
                <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <RotateCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset to Defaults</DialogTitle>
                      <DialogDescription>
                        This will reset all settings to their default values. Your review data 
                        will not be affected. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleResetToDefaults}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset All Settings
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Data Summary */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" /> Data Summary
              </CardTitle>
              <CardDescription>
                Information about your stored data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {localStorage.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Storage Items</p>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {retentionSettings.retentionPeriod === 'forever' ? '∞' : retentionSettings.retentionPeriod}
                  </div>
                  <p className="text-xs text-muted-foreground">Retention Period</p>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {retentionSettings.autoCleanup ? 'On' : 'Off'}
                  </div>
                  <p className="text-xs text-muted-foreground">Auto Cleanup</p>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {retentionSettings.lastCleanup ? 
                      new Date(retentionSettings.lastCleanup).toLocaleDateString() : 
                      'Never'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Last Cleanup</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;

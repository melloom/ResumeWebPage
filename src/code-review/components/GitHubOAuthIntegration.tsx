import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@code-review/components/ui/card";
import { Button } from "@code-review/components/ui/button";
import { Badge } from "@code-review/components/ui/badge";
import { Github, CheckCircle2, AlertCircle, Settings, User } from "lucide-react";
import { useToast } from "@code-review/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

interface GitHubUser {
  id: string;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  html_url: string;
}

export default function GitHubOAuthIntegration() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Check for existing OAuth session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('github_user');
    const token = localStorage.getItem('github_token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        setIsConnected(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('github_user');
        localStorage.removeItem('github_token');
      }
    }

    // Check for OAuth callback
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (code) {
      handleOAuthCallback(code);
    } else if (error === 'oauth_failed') {
      toast({
        title: "Connection Failed",
        description: "GitHub OAuth connection failed. Please try again.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  // Connect with GitHub OAuth
  const connectGitHub = () => {
    setIsConnecting(true);
    
    // Get Client ID from Vite environment variables
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv23liHo1YWmMoIENwg4';
    
    console.log('Client ID:', clientId);
    console.log('Environment variables:', import.meta.env);
    
    if (!clientId) {
      toast({
        title: "Configuration Error",
        description: "GitHub Client ID not configured. Please check your environment variables.",
        variant: "destructive",
      });
      setIsConnecting(false);
      return;
    }
    
    // For local development, we'll handle the callback directly in the app
    const redirectUri = encodeURIComponent(`${import.meta.env.PROD ? 'https://mellowsites.com' : window.location.origin}/code-review/callback`);
    const scope = encodeURIComponent('user:email repo public_repo read:org');
    const state = encodeURIComponent('github');
    
    // Redirect to GitHub OAuth
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    
    console.log('Redirecting to GitHub OAuth:', authUrl);
    console.log('Callback URL:', window.location.origin + '/code-review/callback');
    
    window.location.href = authUrl;
  };

  // Disconnect from GitHub
  const disconnectGitHub = () => {
    localStorage.removeItem('github_user');
    localStorage.removeItem('github_token');
    setUser(null);
    setIsConnected(false);
    
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from GitHub",
    });
  };

  // Handle OAuth callback
  const handleOAuthCallback = async (code: string) => {
    setIsConnecting(true);
    
    try {
      console.log('Exchanging OAuth code for token...');
      
      // Get environment variables from Vite
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv23liHo1YWmMoIENwg4';
      const clientSecret = import.meta.env.VITE_GITHUB_CLIENT_SECRET || '669ad7f4cc4dc717091065356a09d2bb92c02b3b';
      
      console.log('Using Client ID:', clientId);
      console.log('Client Secret configured:', !!clientSecret);
      
      // Use Netlify Functions in production, local proxy in development
      const isProduction = import.meta.env.PROD;
      const apiUrl = isProduction 
        ? `${window.location.origin}/.netlify/functions/github-oauth`
        : 'http://localhost:3001/oauth/token';
      
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
          redirect_uri: `${import.meta.env.PROD ? 'https://mellowsites.com' : window.location.origin}/code-review/callback`,
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API error:', errorText);
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Token response:', data);
      
      if (data.access_token) {
        // Get user information
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        const userData = await userResponse.json();
        console.log('User data:', userData);
        
        // Store user and token
        localStorage.setItem('github_user', JSON.stringify(userData));
        localStorage.setItem('github_token', data.access_token);
        
        setUser(userData);
        setIsConnected(true);
        
        toast({
          title: "Connected to GitHub",
          description: `Successfully connected as ${userData.login}`,
        });
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/code-review/review/new');
      } else if (data.error) {
        throw new Error(data.error_description || data.error || 'Failed to get access token');
      } else {
        console.error('Unexpected response:', data);
        throw new Error('Unexpected response from OAuth server');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to GitHub. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🔐 GitHub Integration</h2>
        <Badge variant={isConnected ? "default" : "secondary"}>
          {isConnected ? "Connected" : "Not Connected"}
        </Badge>
      </div>

      {/* Connection Status */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected && user ? (
            <div className="flex items-center gap-4">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{user.name || user.login}</h3>
                <p className="text-sm text-muted-foreground">@{user.login}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="ml-auto">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Github className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Not Connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect to GitHub to analyze private repositories
              </p>
            </div>
          )}
          
          <div className="flex justify-center">
            {isConnected ? (
              <Button
                variant="outline"
                onClick={disconnectGitHub}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={connectGitHub}
                disabled={isConnecting}
                className="gap-2"
              >
                <Github className="h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect with GitHub"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* OAuth Configuration */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">OAuth Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Client ID</label>
              <div className="mt-1.5 p-3 bg-secondary/20 rounded-md font-mono text-sm">
                {import.meta.env.VITE_GITHUB_CLIENT_ID || 'Not configured'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Client Secret</label>
              <div className="mt-1.5 p-3 bg-secondary/20 rounded-md font-mono text-sm">
                {import.meta.env.VITE_GITHUB_CLIENT_SECRET ? '••••••••••••••••••••••••••••••••••••••••' : 'Not configured'}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Callback URL:</h4>
            <div className="p-3 bg-secondary/20 rounded-md font-mono text-sm">
              {window.location.origin}/github
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Required Scopes:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">user:email</Badge>
              <Badge variant="secondary">repo</Badge>
              <Badge variant="secondary">public_repo</Badge>
              <Badge variant="secondary">read:org</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Benefits of Connecting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Private Repositories
              </h4>
              <p className="text-sm text-muted-foreground">
                Analyze private GitHub repositories
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Higher Rate Limits
              </h4>
              <p className="text-sm text-muted-foreground">
                5,000 requests/hour vs 60 requests/hour
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Organization Access
              </h4>
              <p className="text-sm text-muted-foreground">
                Access to organization repositories
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Unlimited Repositories
              </h4>
              <p className="text-sm text-muted-foreground">
                Analyze unlimited repositories vs 2 for guests
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-secondary/20 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Without GitHub:</strong> 2 public repositories only, 60 requests/hour
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong>With GitHub:</strong> Unlimited repositories (including private), 5,000 requests/hour
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Note */}
      <Card className="glass-card border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            Security Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Your GitHub credentials are stored locally in your browser and are never sent to our servers. The OAuth flow ensures that your access token remains secure.</p>
          <p>You can disconnect at any time to revoke access and remove stored credentials.</p>
        </CardContent>
      </Card>
    </div>
  );
}
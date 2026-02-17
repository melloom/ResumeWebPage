import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@code-review/components/ui/card";
import { Button } from "@code-review/components/ui/button";
import { Badge } from "@code-review/components/ui/badge";
import { Switch } from "@code-review/components/ui/switch";
import { Label } from "@code-review/components/ui/label";
import { Github, CheckCircle2, AlertCircle, Settings, User, Lock, Unlock, Globe } from "lucide-react";
import { useToast } from "@code-review/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@code-review/lib/firebase";
import { getUserProfile } from "@code-review/lib/user-store";

interface GitHubUser {
  id: string;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  html_url: string;
}

interface GitHubConnectionStatusProps {
  onConnectionChange?: (isConnected: boolean, user: GitHubUser | null, privateRepoEnabled: boolean) => void;
}

export default function GitHubConnectionStatus({ onConnectionChange }: GitHubConnectionStatusProps) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [privateRepoEnabled, setPrivateRepoEnabled] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for existing OAuth session on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = () => {
    const storedUser = localStorage.getItem('github_user');
    const token = localStorage.getItem('github_token');
    
    // Check OAuth session first
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsConnected(true);
        onConnectionChange?.(true, userData, privateRepoEnabled);
        return;
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    
    // Check Firebase authentication as fallback
    const firebaseUser = getCurrentUser();
    if (firebaseUser) {
      getUserProfile().then(profile => {
        if (profile?.githubUsername) {
          // Create a mock GitHub user object from Firebase data
          const mockGitHubUser = {
            id: firebaseUser.uid,
            login: profile.githubUsername,
            name: profile.displayName || profile.githubUsername,
            email: profile.email || '',
            avatar_url: profile.photoURL || '',
            html_url: `https://github.com/${profile.githubUsername}`,
          };
          setUser(mockGitHubUser);
          setIsConnected(true);
          onConnectionChange?.(true, mockGitHubUser, privateRepoEnabled);
        }
      }).catch(error => {
        console.error('Error checking Firebase profile:', error);
      });
    } else {
      setIsConnected(false);
      setUser(null);
      onConnectionChange?.(false, null, false);
    }
  };

  const connect = () => {
    // Trigger GitHub OAuth flow
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv23liHo1YWmMoIENwg4';
    const redirectUri = encodeURIComponent(`${import.meta.env.PROD ? 'https://mellowsites.com' : window.location.origin}/code-review/callback`);
    const scope = encodeURIComponent('user:email repo public_repo read:org');
    const state = encodeURIComponent('github');
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    window.location.href = authUrl;
  };

  const disconnect = () => {
    localStorage.removeItem('github_user');
    localStorage.removeItem('github_token');
    setUser(null);
    setIsConnected(false);
    setPrivateRepoEnabled(false);
    onConnectionChange?.(false, null, false);
    
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from GitHub",
    });
  };

  const togglePrivateRepos = (enabled: boolean) => {
    if (!isConnected) {
      toast({
        title: "Connection Required",
        description: "Please connect to GitHub first",
        variant: "destructive",
      });
      return;
    }

    setPrivateRepoEnabled(enabled);
    onConnectionChange?.(true, user, enabled);
    
    if (enabled) {
      toast({
        title: "Private Repositories Enabled",
        description: "You can now analyze private repositories",
      });
    }
  };

  if (isConnected && user) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub Integration
            </div>
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1">
              <p className="font-medium">{user.name || user.login}</p>
              <p className="text-sm text-muted-foreground">@{user.login}</p>
            </div>
            <Button variant="outline" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <Label htmlFor="private-repos" className="text-sm">
                  Enable private repository analysis
                </Label>
              </div>
              <Switch
                id="private-repos"
                checked={privateRepoEnabled}
                onCheckedChange={togglePrivateRepos}
              />
            </div>
            
            {privateRepoEnabled && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                  <Unlock className="h-4 w-4" />
                  <span>Private repository access enabled</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  You can now analyze private repositories that you have access to
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <p>• Analyze public repositories without restrictions</p>
            <p>• Access to your private repositories when enabled</p>
            <p>• Sync analysis data across devices</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub Integration
          </div>
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Not Connected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Connect your GitHub account to analyze private repositories and sync data.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>Public repository analysis</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span>Private repository access</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Cross-device synchronization</span>
            </div>
          </div>
        </div>

        <Button onClick={connect} className="w-full gap-2">
          <Github className="h-4 w-4" />
          Connect GitHub
        </Button>
      </CardContent>
    </Card>
  );
}
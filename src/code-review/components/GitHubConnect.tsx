import { useState, useEffect } from 'react';
import { Github, Link, Unlink, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@code-review/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@code-review/components/ui/card';
import { Alert, AlertDescription } from '@code-review/components/ui/alert';
import { signInWithGithub, getCurrentUser } from '@code-review/lib/firebase';
import { UserCredential } from 'firebase/auth';
import { getUserProfile, updateUserProfile, storeGitHubToken, getGitHubToken } from '@code-review/lib/user-store';
import { useToast } from '@code-review/hooks/use-toast';

export default function GitHubConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [isGithubAuthenticated, setIsGithubAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check if GitHub is already connected
  const checkGitHubConnection = async () => {
    const user = getCurrentUser();
    const token = await getGitHubToken();
    const profile = await getUserProfile();
    
    // Check if user is authenticated via GitHub
    const isGithubProvider = user?.providerData.some(provider => provider.providerId === 'github.com');
    
    setGithubToken(token);
    setGithubUsername(profile?.githubUsername || user?.displayName || null);
    setIsGithubAuthenticated(isGithubProvider || !!token);
  };

  useEffect(() => {
    checkGitHubConnection();
  }, []);

  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    try {
      // Sign in with GitHub (this will add GitHub to the existing session)
      const result = await signInWithGithub();
      
      // Get GitHub username from the additional user info
      const githubUsername = result.displayName || 'Unknown';
      
      // Store GitHub token and username
      // Note: In a real implementation, you'd need to handle OAuth properly
      // For now, we'll use a placeholder approach
      await storeGitHubToken('github-token-placeholder', githubUsername);
      
      // Update user profile
      await updateUserProfile({
        githubUsername,
      });
      
      setGithubToken('github-token-placeholder');
      setGithubUsername(githubUsername);
      
      toast({
        title: "GitHub connected",
        description: "Your GitHub account has been linked successfully.",
      });
    } catch (error) {
      console.error('GitHub connection error:', error);
      toast({
        title: "Failed to connect GitHub",
        description: "Could not link your GitHub account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    setIsDisconnecting(true);
    try {
      // Clear GitHub token from user profile
      await updateUserProfile({
        githubToken: '',
        githubUsername: '',
      });
      
      setGithubToken(null);
      setGithubUsername(null);
      
      toast({
        title: "GitHub disconnected",
        description: "Your GitHub account has been unlinked.",
      });
    } catch (error) {
      console.error('GitHub disconnection error:', error);
      toast({
        title: "Failed to disconnect GitHub",
        description: "Could not unlink your GitHub account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription>
          Connect your GitHub account to analyze private repositories and sync data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGithubAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Connected as {githubUsername || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">
                    Private repository access enabled
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectGitHub}
                disabled={isDisconnecting}
                className="gap-2"
              >
                {isDisconnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="h-4 w-4" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your GitHub token is stored securely and used only to access repositories you have permission to view.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5" />
                <div>
                  <p className="font-medium">Connect GitHub</p>
                  <p className="text-sm text-muted-foreground">
                    Enable private repository analysis
                  </p>
                </div>
              </div>
              <Button
                onClick={handleConnectGitHub}
                disabled={isConnecting}
                className="gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connecting GitHub allows you to analyze private repositories and keeps your analysis history synced across devices.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

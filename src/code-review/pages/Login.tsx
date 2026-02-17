import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Chrome, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@code-review/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@code-review/components/ui/card';
import { Alert, AlertDescription } from '@code-review/components/ui/alert';
import { signInWithGithub, signInWithGoogle, getCurrentUser, signOutUser } from '@code-review/lib/firebase';
import { ensureUserProfile } from '@code-review/lib/user-store';
import { useToast } from '@code-review/hooks/use-toast';

export default function Login() {
  const [isGithubSigningIn, setIsGithubSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [hasPreviousSession, setHasPreviousSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    
    // Check if user was previously signed in
    const previousUser = localStorage.getItem('previousUser');
    if (previousUser) {
      setHasPreviousSession(true);
    }
  }, []);

  const handleGithubSignIn = async () => {
    setIsGithubSigningIn(true);
    try {
      await signInWithGithub();
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      // Store user session
      if (currentUser) {
        localStorage.setItem('previousUser', currentUser.uid);
        await ensureUserProfile();
      }
      
      toast({
        title: "Signed in with GitHub",
        description: "Welcome back!",
      });
      navigate('/code-review/dashboard');
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "GitHub sign-in failed",
        description: errorMessage || "Could not sign in with GitHub. Please check your Firebase configuration.",
        variant: "destructive",
      });
    } finally {
      setIsGithubSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    try {
      await signInWithGoogle();
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      // Store user session
      if (currentUser) {
        localStorage.setItem('previousUser', currentUser.uid);
        await ensureUserProfile();
      }
      
      toast({
        title: "Signed in with Google",
        description: "Welcome back!",
      });
      navigate('/code-review/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Google sign-in failed",
        description: errorMessage || "Could not sign in with Google. Please check your Firebase configuration.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      // Clear previous session
      localStorage.removeItem('previousUser');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Sign-out error:', error);
      toast({
        title: "Sign-out failed",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Already Signed In
              </CardTitle>
              <CardDescription>
                You're signed in as {user.displayName || user.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 mb-4">
                  <img
                    src={user.photoURL || ''}
                    alt={user.displayName || ''}
                    className="w-16 h-16 rounded-full"
                  />
                </div>
                <p className="text-sm text-gray-400">
                  {user.email}
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/code-review/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Chrome className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">
  {hasPreviousSession ? 'Welcome Back' : 'Sign In'}
</CardTitle>
            <CardDescription>
              {hasPreviousSession 
                ? "Welcome back! Sign in to continue where you left off"
                : "Sign in to access your code reviews and analysis history"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleGithubSignIn}
                disabled={isGithubSigningIn || isGoogleSigningIn}
                className="w-full gap-2"
                variant="outline"
              >
                {isGithubSigningIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Github className="h-4 w-4" />
                    Continue with GitHub
                  </>
                )}
              </Button>
              <Button
                onClick={handleGoogleSignIn}
                disabled={isGithubSigningIn || isGoogleSigningIn}
                className="w-full gap-2"
              >
                {isGoogleSigningIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Chrome className="h-4 w-4" />
                    Continue with Google
                  </>
                )}
              </Button>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                By signing in, you agree to our Terms of Service and Privacy Policy.
                Your code reviews will be saved to your account.
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <a href="#" className="text-primary hover:underline">
                  Sign up with GitHub or Google above
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

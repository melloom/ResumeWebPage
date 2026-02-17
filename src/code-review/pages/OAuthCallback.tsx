import { useEffect } from 'react';

export default function OAuthCallback() {
  useEffect(() => {
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      
      console.log('OAuth callback received - Code:', code, 'State:', state, 'Error:', error);
      
      if (error) {
        console.error('OAuth error from GitHub:', error);
        window.location.href = '/code-review/review/new?error=oauth_denied';
        return;
      }
      
      if (!code) {
        console.error('No authorization code found');
        window.location.href = '/code-review/review/new?error=no_code';
        return;
      }
      
      // Store the code for the parent component to handle
      sessionStorage.setItem('oauth_code', code);
      sessionStorage.setItem('oauth_state', state || '');
      
      // Redirect back to the New Review page with the code
      window.location.href = `/code-review/review/new?code=${code}&state=${state}`;
    };

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing GitHub authorization...</p>
      </div>
    </div>
  );
}
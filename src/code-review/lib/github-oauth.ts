// GitHub OAuth Callback Handler
export class GitHubOAuthHandler {
  static handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code) {
      // Store the code and state for processing
      sessionStorage.setItem('oauth_code', code);
      sessionStorage.setItem('oauth_state', state || '');
      
      // Exchange code for access token
      GitHubOAuthHandler.exchangeCodeForToken(code);
    } else {
      console.error('No authorization code found in callback');
      // Redirect to home page
      window.location.href = '/';
    }
  }

  static async exchangeCodeForToken(code: string) {
    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
          client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
          code: code,
          redirect_uri: `${import.meta.env.PROD ? 'https://mellowsites.com' : window.location.origin}/code-review/callback`,
        }),
      });

      const data = await response.json();
      
      if (data.access_token) {
        // Get user information
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        const userData = await userResponse.json();
        
        // Store user and token
        localStorage.setItem('github_user', JSON.stringify(userData));
        localStorage.setItem('github_token', data.access_token);
        
        // Clear temporary storage
        sessionStorage.removeItem('oauth_code');
        sessionStorage.removeItem('oauth_state');
        
        // Redirect to success page or home
        const state = sessionStorage.getItem('oauth_state');
        if (state === 'github') {
          window.location.href = '/code-review/review/new';
        } else {
          window.location.href = '/code-review';
        }
        
        // Dispatch event for parent component
        window.dispatchEvent(new CustomEvent('github_oauth_success', {
          detail: { user: userData, token: data.access_token }
        }));
        
        return data;
      }
    } catch (error) {
      console.error('OAuth token exchange error:', error);
      sessionStorage.removeItem('oauth_code');
      sessionStorage.removeItem('oauth_state');
      
      // Show error message
      window.location.href = '/code-review/review/new?error=oauth_failed';
    }
  }
}

// Auto-handle OAuth callback on page load
if (window.location.pathname === '/.netlify/functions/callback') {
  GitHubOAuthHandler.handleCallback();
}
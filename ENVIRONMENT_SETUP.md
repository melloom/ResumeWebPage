# Environment Variables Setup Guide

## Overview
This project uses environment variables to securely store API keys and configuration. The OpenAI API key should **never** be hardcoded in the codebase.

## Netlify Environment Variables

### Required Environment Variables

For the frontend (client-side):
- `VITE_OPENAI_API_KEY` - OpenAI API key for AI chat and transcription
- `VITE_ELEVENLABS_API_KEY` - ElevenLabs API key for voice synthesis
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_EMAILJS_PUBLIC_KEY` - EmailJS public key
- `VITE_EMAILJS_SERVICE_ID` - EmailJS service ID
- `VITE_GITHUB_TOKEN` - GitHub token for API access
- `VITE_GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `VITE_GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `VITE_WEBHOOK_SECRET` - Webhook secret for GitHub

For Netlify Functions (server-side):
- `OPENAI_API_KEY` - OpenAI API key for server-side transcription

### Setting Up Netlify Environment Variables

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Select your site**: Choose the ResumeWebPage project
3. **Go to Site Settings → Environment Variables**
4. **Add variables**:
   - Click "Add variable"
   - Enter the key (e.g., `VITE_OPENAI_API_KEY`)
   - Enter the value (your actual API key)
   - Set scope (Production/Deploy preview/Development)
   - Click "Save"

5. **For server-side functions**:
   - Add `OPENAI_API_KEY` (without `VITE_` prefix) for Netlify Functions

### Important Notes

- **Never commit actual API keys** to the repository
- The `.env.local` file should only contain placeholder values
- `VITE_` prefix variables are exposed to the frontend
- Variables without `VITE_` prefix are only available in Netlify Functions
- After setting environment variables, **redeploy** your site for changes to take effect

### Local Development

For local development, create a `.env.local` file with placeholder values:

```bash
# .env.local (DO NOT commit actual keys)
VITE_OPENAI_API_KEY=
VITE_ELEVENLABS_API_KEY=
# ... other variables with empty or placeholder values
```

### Security Best Practices

1. **Use different keys** for development and production
2. **Rotate keys regularly** for security
3. **Monitor usage** in your OpenAI dashboard
4. **Use rate limits** to prevent abuse
5. **Never expose server-side keys** to the frontend

### Verification

After deployment, verify the environment variables are working:

1. Open browser dev tools on your deployed site
2. Check Network tab for API calls
3. Verify API calls include proper authentication
4. Test AI chat and transcription features

### Troubleshooting

- **API calls failing**: Check environment variables are set correctly
- **Build errors**: Ensure all required variables are present
- **Permission errors**: Verify API keys have proper permissions
- **Rate limiting**: Check OpenAI usage limits and quotas

## Code Implementation

The code already properly reads from environment variables:

```javascript
// Frontend (client-side)
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Netlify Functions (server-side)
const apiKey = process.env.OPENAI_API_KEY;
```

No hardcoded API keys should exist in the codebase.
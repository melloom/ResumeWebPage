# Security Guide

This document outlines security best practices for this project.

## 🔒 Environment Variables

**CRITICAL**: Never commit sensitive information to the repository. All API keys, secrets, and configuration should be stored in environment variables.

### Required Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`) with the following variables:

#### Firebase Configuration
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase authentication domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase analytics measurement ID

#### EmailJS Configuration
- `VITE_EMAILJS_PUBLIC_KEY` - EmailJS public key
- `VITE_EMAILJS_SERVICE_ID` - EmailJS service ID

## 🛡️ Security Best Practices

### 1. Git Security
- ✅ `.env` files are in `.gitignore` - never commit them
- ✅ Use `.env.example` as a template (without real values)
- ✅ Review commits before pushing to ensure no secrets are included
- ✅ Use `git-secrets` or similar tools to scan for accidentally committed secrets

### 2. Firebase Security Rules
- Ensure Firestore security rules are properly configured
- Restrict read/write access based on authentication
- Review and test security rules regularly

### 3. API Keys
- Firebase API keys are public by design (client-side), but still use environment variables
- EmailJS keys should be kept private
- Rotate keys if they're accidentally exposed

### 4. Authentication
- Use Firebase Authentication for secure user management
- Implement proper password policies
- Use HTTPS in production

### 5. Dependencies
- Regularly update dependencies to patch security vulnerabilities
- Use `npm audit` to check for known vulnerabilities
- Review and update packages regularly

## 🚨 If You Accidentally Commit Secrets

If you accidentally commit sensitive information:

1. **Immediately rotate/revoke the exposed keys**
2. Remove the secrets from git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push (if you're the only contributor):
   ```bash
   git push origin --force --all
   ```
4. Consider using tools like `git-secrets` or `truffleHog` to scan your repository

## 📋 Security Checklist

Before deploying:
- [ ] All environment variables are set in deployment platform (Netlify/Vercel)
- [ ] `.env` file is not committed to git
- [ ] Firebase security rules are configured
- [ ] Dependencies are up to date (`npm audit`)
- [ ] HTTPS is enabled in production
- [ ] No hardcoded secrets in code
- [ ] API rate limiting is configured (if applicable)

## 🔍 Regular Security Audits

Run these commands regularly:
```bash
# Check for vulnerable dependencies
npm audit

# Check for outdated packages
npm outdated

# Scan for secrets (if git-secrets is installed)
git secrets --scan
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)


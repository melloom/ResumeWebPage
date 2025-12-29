# Migration Guide: Moving to Environment Variables

This guide will help you migrate from hardcoded API keys to environment variables for better security.

## ⚠️ Important: Your Current Keys

Before proceeding, save these values from your code:

### Firebase Configuration (from `src/config/firebase.js`):
```
API Key: AIzaSyA6bWg8Ut0DslhPga_12zns95NcPdsuzl8
Auth Domain: resume-portfolio-de77c.firebaseapp.com
Project ID: resume-portfolio-de77c
Storage Bucket: resume-portfolio-de77c.firebasestorage.app
Messaging Sender ID: 874735398272
App ID: 1:874735398272:web:f96ea2dc1a21e02e78e565
Measurement ID: G-ZNXS01BHK8
```

### EmailJS Configuration (from `src/config/emailConfig.js`):
```
Public Key: ZOX5uuIIhnKYyJF1D
Service ID: JOBID1010
```

## 📝 Step-by-Step Migration

### Step 1: Create Your `.env` File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your actual values:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyA6bWg8Ut0DslhPga_12zns95NcPdsuzl8
   VITE_FIREBASE_AUTH_DOMAIN=resume-portfolio-de77c.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=resume-portfolio-de77c
   VITE_FIREBASE_STORAGE_BUCKET=resume-portfolio-de77c.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=874735398272
   VITE_FIREBASE_APP_ID=1:874735398272:web:f96ea2dc1a21e02e78e565
   VITE_FIREBASE_MEASUREMENT_ID=G-ZNXS01BHK8
   
   VITE_EMAILJS_PUBLIC_KEY=ZOX5uuIIhnKYyJF1D
   VITE_EMAILJS_SERVICE_ID=JOBID1010
   ```

### Step 2: Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Verify everything works:
   - Firebase authentication should work
   - EmailJS contact forms should work
   - Check browser console for any errors

### Step 3: Update Deployment Platform

#### For Netlify:
1. Go to your Netlify dashboard
2. Navigate to Site settings → Environment variables
3. Add all the environment variables from your `.env` file
4. Redeploy your site

#### For Vercel:
1. Go to your Vercel dashboard
2. Navigate to Project settings → Environment Variables
3. Add all the environment variables from your `.env` file
4. Redeploy your site

### Step 4: Verify Production

After deploying:
1. Test Firebase authentication on production
2. Test contact forms on production
3. Check browser console for errors

## 🔒 Security Notes

- ✅ Your `.env` file is now in `.gitignore` - it won't be committed
- ✅ Hardcoded keys have been removed from the code
- ✅ All sensitive data is now in environment variables
- ⚠️ **Important**: Make sure your `.env` file is never committed to git

## 🚨 If Something Breaks

If you encounter issues:

1. Check that all environment variables are set correctly
2. Verify variable names start with `VITE_` (required for Vite)
3. Restart your development server after creating `.env`
4. Clear browser cache if needed
5. Check browser console for specific error messages

## ✅ Verification Checklist

- [ ] `.env` file created with all values
- [ ] Development server runs without errors
- [ ] Firebase authentication works
- [ ] EmailJS contact forms work
- [ ] Environment variables added to deployment platform
- [ ] Production site works correctly
- [ ] `.env` is in `.gitignore` (verify it's not tracked)

## 📚 Next Steps

After migration:
1. Review `SECURITY.md` for security best practices
2. Consider rotating your API keys for extra security
3. Set up regular security audits
4. Keep dependencies updated


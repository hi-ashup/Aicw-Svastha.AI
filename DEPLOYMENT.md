# Deployment & Environment Setup Guide

## Overview

Svastha.AI can be deployed to multiple platforms. This guide covers setup for:
- **Vercel** (Recommended - simplest, fastest)
- **Firebase Hosting** (Integrated with backend)
- **GitHub Actions** (CI/CD automation)

---

## Required Environment Variables

### Essential (Required for any deployment)
- `VITE_GEMINI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com)

### Optional (For Firebase Cloud Sync)
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIRESTORE_DATABASE_ID`

> **Note**: The app works without Firebase variables. Cloud persistence will simply be skipped if not configured.

---

## Deployment Platforms

### Option 1: Vercel (⭐ Recommended)

**Fastest & Easiest**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Fix: Deployment configuration"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Select your GitHub repository
   - Vercel auto-detects Vite configuration

3. **Set Environment Variables**
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add `VITE_GEMINI_API_KEY` (required)
   - Add Firebase variables if desired (optional)

4. **Deploy**
   - Click "Deploy"
   - App is live at `<project-name>.vercel.app`
   - Automatic deployments on every `git push`

**Advantages:**
- Zero configuration needed
- Auto-HTTPS, free SSL
- Automatic preview deployments for PRs
- Built-in analytics and monitoring

---

### Option 2: Firebase Hosting

**Best for Firebase integration**

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Deploy existing files: `No`

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

5. **Configure Environment Variables**
   - Add to `vercel.json` or set in Firebase Console
   - Environment variables are set during build, not at runtime

**Advantages:**
- Seamless Firestore integration
- Custom domain support
- Excellent Firebase backend integration

---

### Option 3: GitHub Actions (CI/CD)

**Automated testing & building**

1. **Workflow Already Configured**
   - File: `.github/workflows/nodejs.yml`
   - Runs on: `npm push` to `main` or `master`

2. **Workflow Tests**
   - Runs on: Node.js 18.x, 20.x, 24.x
   - Installs dependencies
   - Type checks (lint)
   - Builds production bundle

3. **View Results**
   - Go to GitHub repo → Actions tab
   - See build status, logs, and compiled artifacts

4. **Fix Build Errors**
   - Check error logs in GitHub Actions
   - Common issues:
     - Missing dependencies: `npm install`
     - Type errors: Fix in code, commit, push
     - Missing lock file: Already committed now

---

## Troubleshooting

### Build Error: "Cannot resolve firebase-applet-config.json"

**Why**: Firebase config file is in `.gitignore` (for security)

**Solution**:
- Use environment variables instead (see "Required Environment Variables")
- Or add Firebase variables to deployment platform

### Warning: "Firebase configuration not available"

**Why**: No Firebase env vars set (this is OK!)

**Solution**: 
- App works without it - Firebase is optional
- To enable Firebase sync, set `VITE_FIREBASE_*` variables

### API Error: "GEMINI_API_KEY is not configured"

**Why**: Missing Gemini API key

**Solution**:
1. Get key from [aistudio.google.com](https://aistudio.google.com)
2. Set `VITE_GEMINI_API_KEY` in deployment platform

### TypeScript/Build Error in GitHub Actions

**Why**: Likely a code issue detected by `npm run lint`

**Solution**:
```bash
# Test locally before pushing
npm run lint

# Fix type errors in your IDE
# Then commit and push again
```

---

## Local Development

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
cp .env.example .env.local

# 3. Add your API keys to .env.local
# VITE_GEMINI_API_KEY=your_key_here

# 4. Optional: Add Firebase config
cp firebase-applet-config.example.json firebase-applet-config.json
# Edit with your Firebase credentials

# 5. Start dev server
npm run dev
```

### Testing Build Locally

```bash
# Test production build
npm run build
npm run preview

# Opens at http://localhost:4173
```

---

## Environment Variable Reference

### Accessing Variables in Code

**Browser (Frontend)**:
```typescript
import.meta.env.VITE_GEMINI_API_KEY
import.meta.env.VITE_FIREBASE_PROJECT_ID
```

**Build Time**:
```bash
# Via npm run build
VITE_GEMINI_API_KEY=xyz npm run build
```

### Special Notes

- Variables must start with `VITE_` to be accessible in browser code
- Do NOT use `process.env` in Vite (won't work)
- `.env.local` is gitignored for security
- Environment variables set in deployment dashboards override `.env` files

---

## Security Best Practices

✅ **DO**:
- Keep API keys in environment variables
- Use `.gitignore` for sensitive files
- Enable HTTPS (automatic on Vercel/Firebase)
- Rotate API keys periodically

❌ **DON'T**:
- Commit `.env` files
- Commit `firebase-applet-config.json`
- Share API keys in code or issues
- Use the same key across dev/prod

---

## Performance Tips

- Vercel automatically optimizes builds (~180KB gzipped)
- GitHub Actions runs tests on 3 Node versions
- Use `npm run preview` to test production build locally
- Monitor bundle size: `npm run build` shows sizes

---

## Further Help

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [GitHub Actions CI/CD](https://docs.github.com/en/actions)


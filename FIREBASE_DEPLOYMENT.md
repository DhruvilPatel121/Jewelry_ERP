# Complete Firebase Deployment Guide

## Step-by-Step Deployment Instructions

### Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Google account
- [ ] Project code downloaded/cloned

---

## Part 1: Firebase Project Setup (15 minutes)

### Step 1: Create Firebase Project

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   ```
   Click "Add project" button
   ↓
   Project name: jewelry-erp-production
   ↓
   Click "Continue"
   ↓
   Google Analytics: Enable (recommended) or Disable
   ↓
   Click "Create project"
   ↓
   Wait 30-60 seconds
   ↓
   Click "Continue"
   ```

3. **You're now in the Firebase Console Dashboard**

### Step 2: Register Web App

1. **Add Web App**
   ```
   Click the Web icon (</>)
   ↓
   App nickname: Jewelry ERP Web
   ↓
   ✅ Check "Also set up Firebase Hosting"
   ↓
   Click "Register app"
   ```

2. **IMPORTANT: Copy Firebase Config**
   
   You'll see something like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "jewelry-erp-xxxxx.firebaseapp.com",
     projectId: "jewelry-erp-xxxxx",
     storageBucket: "jewelry-erp-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:xxxxxxxxxxxxx"
   };
   ```
   
   **Copy these values - you'll need them in Step 5!**

3. **Click "Continue to console"**

### Step 3: Enable Firestore Database

1. **Navigate to Firestore**
   ```
   Left sidebar → Build → Firestore Database
   ↓
   Click "Create database"
   ```

2. **Configure Database**
   ```
   Mode: Start in production mode
   ↓
   Click "Next"
   ↓
   Location: Choose closest to your users
   (e.g., us-central, asia-south1, europe-west)
   ↓
   Click "Enable"
   ↓
   Wait 1-2 minutes for database creation
   ```

### Step 4: Enable Authentication

1. **Navigate to Authentication**
   ```
   Left sidebar → Build → Authentication
   ↓
   Click "Get started"
   ```

2. **Enable Email/Password**
   ```
   Click "Sign-in method" tab
   ↓
   Click "Email/Password"
   ↓
   Toggle "Enable" to ON
   ↓
   Click "Save"
   ```

---

## Part 2: Local Project Configuration (10 minutes)

### Step 5: Configure Environment Variables

1. **Navigate to project directory**
   ```bash
   cd /workspace/app-8zur1sisfyf5
   ```

2. **Create .env file**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Or create new file
   nano .env
   ```

3. **Add your Firebase configuration**
   
   Open `.env` and paste your values from Step 2:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=jewelry-erp-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=jewelry-erp-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=jewelry-erp-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
   ```
   
   **Save the file (Ctrl+O, Enter, Ctrl+X in nano)**

### Step 6: Install Dependencies

```bash
# Install all project dependencies
pnpm install

# This will take 2-3 minutes
```

### Step 7: Firebase CLI Setup

1. **Login to Firebase**
   ```bash
   firebase login
   ```
   
   - Browser will open
   - Sign in with the same Google account
   - Allow Firebase CLI access
   - Return to terminal

2. **Initialize Firebase in Project**
   ```bash
   firebase init
   ```
   
   **Answer the prompts:**
   ```
   ? Which Firebase features? 
   ◉ Firestore
   ◉ Hosting
   (Use Space to select, Enter to confirm)
   
   ? Please select an option:
   → Use an existing project
   
   ? Select a default Firebase project:
   → jewelry-erp-xxxxx (the one you created)
   
   ? What file should be used for Firestore Rules?
   → firestore.rules (press Enter)
   
   ? What file should be used for Firestore indexes?
   → firestore.indexes.json (press Enter)
   
   ? What do you want to use as your public directory?
   → dist (press Enter)
   
   ? Configure as a single-page app?
   → Yes
   
   ? Set up automatic builds and deploys with GitHub?
   → No
   
   ? File dist/index.html already exists. Overwrite?
   → No
   ```

---

## Part 3: Deploy Firestore Rules (5 minutes)

### Step 8: Deploy Security Rules

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# You should see:
# ✔ Deploy complete!
```

**Verify in Firebase Console:**
```
Go to Firestore Database → Rules tab
You should see the security rules deployed
```

---

## Part 4: Build and Deploy Application (10 minutes)

### Step 9: Build the Application

```bash
# Build for production
pnpm build

# This creates optimized files in dist/ folder
# Takes 1-2 minutes
```

**Verify build:**
```bash
# Check dist folder exists
ls -la dist/

# You should see:
# index.html, assets/, manifest.json, sw.js, etc.
```

### Step 10: Test Locally (Optional but Recommended)

```bash
# Preview the production build
pnpm preview

# Open http://localhost:4173 in browser
# Test the app
# Press Ctrl+C to stop
```

### Step 11: Deploy to Firebase Hosting

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Wait 1-2 minutes
# You'll see:
# ✔ Deploy complete!
# 
# Hosting URL: https://jewelry-erp-xxxxx.web.app
```

**🎉 Your app is now live!**

---

## Part 5: Post-Deployment Configuration (5 minutes)

### Step 12: Configure Authorized Domains

1. **Go to Firebase Console**
   ```
   Authentication → Settings → Authorized domains
   ```

2. **Add your domain**
   ```
   Your domains should include:
   ✓ localhost (already there)
   ✓ jewelry-erp-xxxxx.web.app (already there)
   ✓ jewelry-erp-xxxxx.firebaseapp.com (already there)
   
   If you have a custom domain, add it here
   ```

### Step 13: Test the Deployed Application

1. **Open your app**
   ```
   https://jewelry-erp-xxxxx.web.app
   ```

2. **Test Registration (Company A)**
   ```
   Click "Register"
   ↓
   Email: company-a@test.com
   Username: company_a
   Password: Test@123
   ↓
   Click "Sign Up"
   ↓
   Enter Company Name: "Gold Jewelers A"
   ↓
   Click "Create Company"
   ```

3. **Add Test Data**
   ```
   - Add a customer
   - Add an item
   - Create a sale
   - Check dashboard
   ```

4. **Logout and Test Company B**
   ```
   Click Logout
   ↓
   Register new account:
   Email: company-b@test.com
   Username: company_b
   Password: Test@123
   ↓
   Create Company: "Silver Jewelers B"
   ↓
   Add different customers and sales
   ```

5. **Verify Data Isolation**
   ```
   Login as Company A → See only Company A data
   Login as Company B → See only Company B data
   ✅ Multi-company working!
   ```

### Step 14: Test PWA Installation

**On Mobile:**
1. Open the app URL in Chrome/Safari
2. Look for "Add to Home Screen" prompt
3. Install the app
4. Open from home screen
5. Test offline mode (turn off WiFi)

**On Desktop:**
1. Open in Chrome
2. Look for install icon in address bar
3. Click "Install"
4. App opens in standalone window

---

## Part 6: Monitoring and Maintenance

### Step 15: Set Up Monitoring

1. **Firebase Console → Analytics**
   - View user activity
   - Track page views
   - Monitor errors

2. **Firestore → Usage**
   - Monitor read/write operations
   - Check storage usage
   - Watch for quota limits

3. **Authentication → Users**
   - View registered users
   - Monitor sign-ins
   - Manage user accounts

### Step 16: Regular Maintenance Tasks

**Daily:**
- Check error logs in Firebase Console
- Monitor user registrations

**Weekly:**
- Review Firestore usage
- Check security rules are working
- Test app functionality

**Monthly:**
- Update dependencies: `pnpm update`
- Review and optimize queries
- Check for Firebase SDK updates

---

## Troubleshooting Common Issues

### Issue 1: "Firebase config not found"

**Solution:**
```bash
# Check .env file exists
cat .env

# Verify all variables start with VITE_
# Restart dev server
pnpm dev
```

### Issue 2: "Permission denied" in Firestore

**Solution:**
```bash
# Redeploy rules
firebase deploy --only firestore:rules

# Check user is authenticated
# Verify company_id is set in user document
```

### Issue 3: "Build fails"

**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm build
```

### Issue 4: "Can't see other company's data"

**Solution:**
This is correct! Data isolation is working as designed.
Each company should only see their own data.

### Issue 5: "PWA not installing"

**Solution:**
- Ensure HTTPS (Firebase Hosting provides this)
- Check manifest.json is accessible
- Verify service worker registration in console
- Try in Chrome/Edge (best PWA support)

---

## Updating the Application

### To Deploy Updates:

```bash
# 1. Make your code changes
# 2. Test locally
pnpm dev

# 3. Build
pnpm build

# 4. Deploy
firebase deploy --only hosting

# Done! Updates are live in 1-2 minutes
```

### To Update Firestore Rules:

```bash
# 1. Edit firestore.rules file
# 2. Deploy
firebase deploy --only firestore:rules
```

---

## Custom Domain Setup (Optional)

### Step 1: Add Custom Domain

1. **Firebase Console → Hosting**
2. Click "Add custom domain"
3. Enter your domain: `www.yourcompany.com`
4. Follow DNS configuration instructions
5. Wait for SSL certificate (24-48 hours)

### Step 2: Update Authorized Domains

1. **Authentication → Settings → Authorized domains**
2. Add your custom domain
3. Save

---

## Backup and Recovery

### Manual Backup

```bash
# Export Firestore data
firebase firestore:export gs://jewelry-erp-xxxxx.appspot.com/backups/$(date +%Y%m%d)
```

### Restore from Backup

```bash
# Import Firestore data
firebase firestore:import gs://jewelry-erp-xxxxx.appspot.com/backups/20260117
```

---

## Cost Management

### Free Tier Limits (Spark Plan)

**Firestore:**
- 1 GB storage
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day

**Hosting:**
- 10 GB storage
- 360 MB/day bandwidth

**Authentication:**
- Unlimited users

### When to Upgrade to Blaze Plan

- Exceeding daily limits
- Need phone authentication
- Want automated backups
- Require Cloud Functions

**Blaze Plan:** Pay-as-you-go (still very affordable for small businesses)

---

## Security Checklist

- [x] Firestore rules deployed
- [x] Authentication enabled
- [x] HTTPS enabled (automatic with Firebase Hosting)
- [x] Environment variables secured
- [x] .env file in .gitignore
- [x] Multi-company data isolation tested
- [x] PWA security headers configured

---

## Success Criteria

Your deployment is successful when:

- [x] App loads at https://your-project.web.app
- [x] Users can register and login
- [x] Company creation works
- [x] Data isolation works (Company A can't see Company B data)
- [x] All CRUD operations work
- [x] Calculations are accurate
- [x] Reports generate correctly
- [x] PWA installs on mobile
- [x] Offline mode works
- [x] No console errors

---

## Support and Resources

**Firebase Documentation:**
- Firestore: https://firebase.google.com/docs/firestore
- Authentication: https://firebase.google.com/docs/auth
- Hosting: https://firebase.google.com/docs/hosting

**Project Documentation:**
- See FIREBASE_SETUP.md for detailed setup
- See README.md for feature documentation

---

## Quick Reference Commands

```bash
# Login to Firebase
firebase login

# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only rules
firebase deploy --only firestore:rules

# View logs
firebase hosting:channel:list

# Open Firebase Console
firebase open

# Build project
pnpm build

# Run locally
pnpm dev

# Preview production build
pnpm preview
```

---

**Deployment Complete! 🚀**

Your Jewelry ERP multi-company system is now live on Firebase!

**Next Steps:**
1. Share the URL with your users
2. Create user accounts for each company
3. Train users on the system
4. Monitor usage in Firebase Console
5. Collect feedback and iterate

**Need Help?**
- Check Firebase Console for errors
- Review Firestore rules
- Check browser console for client errors
- Verify environment variables are set correctly

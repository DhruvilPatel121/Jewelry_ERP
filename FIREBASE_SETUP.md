# Firebase Setup Guide - Jewelry ERP Multi-Company System

This guide provides complete step-by-step instructions to set up Firebase for the Jewelry ERP application with multi-company support.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Firestore Database Setup](#firestore-database-setup)
5. [Authentication Setup](#authentication-setup)
6. [Security Rules](#security-rules)
7. [Local Development](#local-development)
8. [Deployment](#deployment)

---

## Prerequisites

- Node.js 18+ installed
- pnpm package manager installed
- Google account for Firebase
- Basic understanding of Firebase services

---

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `jewelry-erp` (or your preferred name)
4. Click **Continue**
5. **Google Analytics**: Choose to enable or disable (optional)
6. Click **Create project**
7. Wait for project creation to complete
8. Click **Continue** to go to project dashboard

### Step 2: Register Web App

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `Jewelry ERP Web`
3. **Check** "Also set up Firebase Hosting for this app"
4. Click **Register app**
5. **Copy the Firebase configuration** - you'll need this later:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```
6. Click **Continue to console**

---

## Firebase Configuration

### Step 3: Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify login
firebase projects:list
```

### Step 4: Initialize Firebase in Project

```bash
# Navigate to project directory
cd /workspace/app-8zur1sisfyf5

# Initialize Firebase
firebase init
```

**During initialization, select:**
- **Firestore**: Yes
- **Hosting**: Yes
- **Storage**: Yes (optional, for future file uploads)

**Configuration options:**
- Firestore Rules: `firestore.rules`
- Firestore Indexes: `firestore.indexes.json`
- Public directory: `dist`
- Configure as single-page app: **Yes**
- Set up automatic builds: **No**
- Overwrite index.html: **No**

### Step 5: Configure Environment Variables

Create `.env` file in project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important**: Replace all values with your actual Firebase configuration from Step 2.

---

## Firestore Database Setup

### Step 6: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we'll add rules later)
4. Choose database location (select closest to your users)
5. Click **Enable**

### Step 7: Create Collections

Firestore will automatically create collections when you add documents. The app will create these collections:

**Collections Structure:**
```
companies/
  {companyId}/
    - name: string
    - owner_id: string
    - created_at: timestamp
    - settings: object

customers/
  {customerId}/
    - company_id: string (CRITICAL for data isolation)
    - name: string
    - mobile: string
    - city: string
    - gst_no: string
    - address: string
    - opening_amount: number
    - opening_fine: number
    - closing_amount: number
    - closing_fine: number
    - created_at: timestamp

items/
  {itemId}/
    - company_id: string
    - name: string
    - description: string
    - created_at: timestamp

sales/
  {saleId}/
    - company_id: string
    - customer_id: string
    - invoice_no: string
    - date: string
    - item_name: string
    - weight: number
    - bag: number
    - net_weight: number
    - ghat_per_kg: number
    - total_ghat: number
    - touch: number
    - wastage: number
    - fine: number
    - pics: number
    - rate: number
    - amount: number
    - remarks: string
    - created_at: timestamp

purchases/
  {purchaseId}/
    - company_id: string
    - customer_id: string
    - invoice_no: string
    - date: string
    - item_name: string
    - weight: number
    - bag: number
    - net_weight: number
    - ghat_per_kg: number
    - total_ghat: number
    - touch: number
    - wastage: number
    - fine: number
    - pics: number
    - rate: number
    - amount: number
    - remarks: string
    - created_at: timestamp

payments/
  {paymentId}/
    - company_id: string
    - customer_id: string
    - invoice_no: string
    - date: string
    - transaction_type: string (payment/receipt)
    - payment_type: string
    - gross: number
    - purity: number
    - wast_badi_kg: number
    - rate: number
    - amount: number
    - remarks: string
    - created_at: timestamp

expenses/
  {expenseId}/
    - company_id: string
    - date: string
    - category: string
    - amount: number
    - description: string
    - created_at: timestamp

users/
  {userId}/
    - email: string
    - username: string
    - company_id: string (links user to company)
    - role: string (admin/user)
    - created_at: timestamp
```

**CRITICAL**: Every collection (except `companies` and `users`) MUST have `company_id` field for data isolation.

---

## Authentication Setup

### Step 8: Enable Authentication Methods

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on **Email/Password**
   - Toggle **Enable**
   - Click **Save**

### Step 9: Configure Authorized Domains

1. In Authentication, go to **Settings** tab
2. Scroll to **Authorized domains**
3. Add your domains:
   - `localhost` (already added)
   - Your production domain (e.g., `jewelry-erp.web.app`)

---

## Security Rules

### Step 10: Configure Firestore Security Rules

Create/update `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get user's company_id
    function getUserCompanyId() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.company_id;
    }
    
    // Helper function to check if user owns the company
    function isCompanyOwner(companyId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/companies/$(companyId)).data.owner_id == request.auth.uid;
    }
    
    // Helper function to check if document belongs to user's company
    function belongsToUserCompany() {
      return isAuthenticated() && 
             resource.data.company_id == getUserCompanyId();
    }
    
    // Helper function to check if new document has correct company_id
    function hasCorrectCompanyId() {
      return request.resource.data.company_id == getUserCompanyId();
    }
    
    // Companies collection
    match /companies/{companyId} {
      // Users can read their own company
      allow read: if isAuthenticated() && getUserCompanyId() == companyId;
      
      // Only company owner can update
      allow update: if isCompanyOwner(companyId);
      
      // Anyone authenticated can create a company (for registration)
      allow create: if isAuthenticated();
      
      // No deletion allowed
      allow delete: if false;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own document
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can update their own document (except company_id and role)
      allow update: if isAuthenticated() && 
                       request.auth.uid == userId &&
                       request.resource.data.company_id == resource.data.company_id &&
                       request.resource.data.role == resource.data.role;
      
      // System creates user document (via Cloud Function or client)
      allow create: if isAuthenticated() && request.auth.uid == userId;
      
      // No deletion
      allow delete: if false;
    }
    
    // Customers collection
    match /customers/{customerId} {
      allow read: if belongsToUserCompany();
      allow create: if isAuthenticated() && hasCorrectCompanyId();
      allow update: if belongsToUserCompany() && hasCorrectCompanyId();
      allow delete: if belongsToUserCompany();
    }
    
    // Items collection
    match /items/{itemId} {
      allow read: if belongsToUserCompany();
      allow create: if isAuthenticated() && hasCorrectCompanyId();
      allow update: if belongsToUserCompany() && hasCorrectCompanyId();
      allow delete: if belongsToUserCompany();
    }
    
    // Sales collection
    match /sales/{saleId} {
      allow read: if belongsToUserCompany();
      allow create: if isAuthenticated() && hasCorrectCompanyId();
      allow update: if belongsToUserCompany() && hasCorrectCompanyId();
      allow delete: if belongsToUserCompany();
    }
    
    // Purchases collection
    match /purchases/{purchaseId} {
      allow read: if belongsToUserCompany();
      allow create: if isAuthenticated() && hasCorrectCompanyId();
      allow update: if belongsToUserCompany() && hasCorrectCompanyId();
      allow delete: if belongsToUserCompany();
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if belongsToUserCompany();
      allow create: if isAuthenticated() && hasCorrectCompanyId();
      allow update: if belongsToUserCompany() && hasCorrectCompanyId();
      allow delete: if belongsToUserCompany();
    }
    
    // Expenses collection
    match /expenses/{expenseId} {
      allow read: if belongsToUserCompany();
      allow create: if isAuthenticated() && hasCorrectCompanyId();
      allow update: if belongsToUserCompany() && hasCorrectCompanyId();
      allow delete: if belongsToUserCompany();
    }
  }
}
```

**Deploy rules:**
```bash
firebase deploy --only firestore:rules
```

---

## Local Development

### Step 11: Install Dependencies

```bash
# Install Firebase SDK
pnpm add firebase

# Install date utilities (if not already installed)
pnpm add date-fns
```

### Step 12: Run Development Server

```bash
# Start development server
pnpm dev

# App will run on http://localhost:5173
```

### Step 13: Test Multi-Company Functionality

**Test Scenario 1: Company A**
1. Register with email: `company-a@test.com`
2. Create company: "Gold Jewelers A"
3. Add customers, sales, purchases
4. Logout

**Test Scenario 2: Company B**
1. Register with email: `company-b@test.com`
2. Create company: "Silver Jewelers B"
3. Add customers, sales, purchases
4. Verify you CANNOT see Company A's data

**Test Scenario 3: Data Isolation**
1. Login as Company A
2. Verify you only see Company A's data
3. Login as Company B
4. Verify you only see Company B's data

---

## Deployment

### Step 14: Build for Production

```bash
# Build the application
pnpm build

# Test the build locally
pnpm preview
```

### Step 15: Deploy to Firebase Hosting

```bash
# Deploy everything (hosting + rules)
firebase deploy

# Or deploy only hosting
firebase deploy --only hosting

# Or deploy only rules
firebase deploy --only firestore:rules
```

### Step 16: Verify Deployment

1. Firebase will provide a hosting URL: `https://your-project-id.web.app`
2. Open the URL in browser
3. Test registration and login
4. Test multi-company data isolation
5. Test PWA installation on mobile

---

## Multi-Company Architecture

### How It Works

1. **Registration Flow:**
   - User registers with email/password
   - System creates user document in `users` collection
   - User creates/joins a company
   - `company_id` is stored in user document

2. **Data Isolation:**
   - Every document has `company_id` field
   - Firestore rules enforce: `resource.data.company_id == getUserCompanyId()`
   - Users can ONLY access data with their `company_id`

3. **Authentication Flow:**
   - User logs in with email/password
   - Firebase Auth provides user ID
   - App fetches user document to get `company_id`
   - All queries filter by `company_id`

4. **Security:**
   - Firestore rules prevent cross-company data access
   - Even if a user knows another company's document ID, they cannot access it
   - Company owners have full control over their company data

### Company Switching (Future Enhancement)

To allow users to belong to multiple companies:
1. Change `company_id` in users to `company_ids: string[]`
2. Add `active_company_id` field
3. Add company switcher UI
4. Update rules to check if `resource.data.company_id in getUserCompanyIds()`

---

## Troubleshooting

### Issue: "Missing or insufficient permissions"

**Solution:**
1. Check Firestore rules are deployed: `firebase deploy --only firestore:rules`
2. Verify user is authenticated
3. Check user document has `company_id`
4. Verify document has correct `company_id`

### Issue: "Firebase not initialized"

**Solution:**
1. Check `.env` file has all Firebase config values
2. Verify environment variables start with `VITE_`
3. Restart development server after changing `.env`

### Issue: "Cannot read data from other company"

**Solution:**
This is expected behavior! Data isolation is working correctly.

### Issue: PWA not installing

**Solution:**
1. Ensure app is served over HTTPS (Firebase Hosting provides this)
2. Check `manifest.json` is accessible
3. Verify service worker is registered
4. Check browser console for errors

---

## Firebase Free Tier Limits

**Spark Plan (Free):**
- **Firestore:**
  - 1 GB storage
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day

- **Authentication:**
  - Unlimited users
  - Email/Password: Free

- **Hosting:**
  - 10 GB storage
  - 360 MB/day bandwidth

**When to Upgrade:**
- Exceeding daily read/write limits
- Need more storage
- Need advanced features (phone auth, etc.)

---

## Backup Strategy

### Manual Backup

```bash
# Export Firestore data
firebase firestore:export gs://your-bucket-name/backups/$(date +%Y%m%d)
```

### Automated Backup (Requires Blaze Plan)

Set up scheduled Cloud Functions for automatic backups.

---

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use environment variables** for all Firebase config
3. **Test security rules** thoroughly before production
4. **Enable App Check** (optional, for additional security)
5. **Monitor Firebase Console** for unusual activity
6. **Regularly review security rules**
7. **Keep Firebase SDK updated**

---

## Next Steps

1. ✅ Complete Firebase setup
2. ✅ Test multi-company functionality
3. ✅ Deploy to Firebase Hosting
4. ✅ Test PWA installation
5. ✅ Configure custom domain (optional)
6. ✅ Set up monitoring and analytics
7. ✅ Train users on the system

---

## Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firestore Security Rules**: https://firebase.google.com/docs/firestore/security/get-started
- **Firebase Hosting**: https://firebase.google.com/docs/hosting
- **Firebase CLI Reference**: https://firebase.google.com/docs/cli

---

**Setup Complete! 🎉**

Your Jewelry ERP is now configured for multi-company operation with Firebase.

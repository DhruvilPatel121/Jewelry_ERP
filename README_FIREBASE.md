# Jewelry ERP - Multi-Company Firebase System

## 🎯 Overview

This is a complete, production-ready Jewelry ERP system built with Firebase that supports **multiple companies** with complete data isolation. Each company can only access their own data, making it perfect for SaaS deployment.

## 🏢 Multi-Company Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    Firebase Project                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Company A   │  │  Company B   │  │  Company C   │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤ │
│  │ Customers    │  │ Customers    │  │ Customers    │ │
│  │ Sales        │  │ Sales        │  │ Sales        │ │
│  │ Purchases    │  │ Purchases    │  │ Purchases    │ │
│  │ Items        │  │ Items        │  │ Items        │ │
│  │ Payments     │  │ Payments     │  │ Payments     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  🔒 Firestore Security Rules ensure data isolation      │
└─────────────────────────────────────────────────────────┘
```

### Key Features

1. **Complete Data Isolation**
   - Each company has a unique `company_id`
   - All documents include `company_id` field
   - Firestore rules enforce access control
   - Company A cannot see Company B's data

2. **User-Company Relationship**
   - Each user belongs to one company
   - User document stores `company_id`
   - All queries automatically filter by company

3. **Security**
   - Firestore security rules prevent cross-company access
   - Even with direct document IDs, access is denied
   - Server-side enforcement (cannot be bypassed)

## 📋 Complete Documentation

### 1. Setup Documentation
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Complete Firebase configuration guide
- **[FIREBASE_DEPLOYMENT.md](./FIREBASE_DEPLOYMENT.md)** - Step-by-step deployment instructions

### 2. Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure Firebase
cp .env.example .env
# Edit .env with your Firebase credentials

# 3. Run locally
pnpm dev

# 4. Build for production
pnpm build

# 5. Deploy to Firebase
firebase deploy
```

## 🔐 Security Implementation

### Firestore Security Rules

Every collection has rules like this:

```javascript
match /customers/{customerId} {
  // Can only read documents with matching company_id
  allow read: if resource.data.company_id == getUserCompanyId();
  
  // Can only create with correct company_id
  allow create: if request.resource.data.company_id == getUserCompanyId();
  
  // Can only update own company's documents
  allow update: if resource.data.company_id == getUserCompanyId();
  
  // Can only delete own company's documents
  allow delete: if resource.data.company_id == getUserCompanyId();
}
```

### Data Structure

Every document includes `company_id`:

```javascript
// Customer document
{
  id: "customer_123",
  company_id: "company_abc",  // ← CRITICAL for isolation
  name: "John Doe",
  mobile: "1234567890",
  // ... other fields
}

// Sale document
{
  id: "sale_456",
  company_id: "company_abc",  // ← CRITICAL for isolation
  customer_id: "customer_123",
  amount: 50000,
  // ... other fields
}
```

## 🚀 Deployment Process

### Prerequisites

1. **Firebase Account** (free)
2. **Firebase CLI** installed
3. **Node.js 18+** installed
4. **pnpm** package manager

### Step-by-Step Deployment

**See [FIREBASE_DEPLOYMENT.md](./FIREBASE_DEPLOYMENT.md) for complete instructions**

Quick summary:
1. Create Firebase project
2. Enable Firestore and Authentication
3. Configure environment variables
4. Deploy Firestore rules
5. Build and deploy application
6. Test multi-company functionality

## 📱 PWA Support

### Features

- ✅ Installable on mobile and desktop
- ✅ Offline support with service worker
- ✅ App-like experience
- ✅ Push notifications ready (future)
- ✅ Background sync ready (future)

### Installation

**Mobile (Android/iOS):**
1. Open app in Chrome/Safari
2. Tap "Add to Home Screen"
3. App installs like native app

**Desktop (Chrome/Edge):**
1. Open app in browser
2. Click install icon in address bar
3. App opens in standalone window

### PWA Configuration

- **Manifest**: `/public/manifest.json`
- **Service Worker**: `/public/sw.js`
- **Icons**: `/public/favicon.png`

## 🧪 Testing Multi-Company Functionality

### Test Scenario 1: Create Company A

```bash
1. Open app: https://your-app.web.app
2. Click "Register"
3. Email: company-a@test.com
4. Password: Test@123
5. Username: company_a
6. Click "Sign Up"
7. Enter Company Name: "Gold Jewelers A"
8. Click "Create Company"
9. Add customers, items, sales
```

### Test Scenario 2: Create Company B

```bash
1. Logout from Company A
2. Click "Register"
3. Email: company-b@test.com
4. Password: Test@123
5. Username: company_b
6. Click "Sign Up"
7. Enter Company Name: "Silver Jewelers B"
8. Click "Create Company"
9. Add different customers, items, sales
```

### Test Scenario 3: Verify Data Isolation

```bash
1. Login as company-a@test.com
   → Should see ONLY Company A's data
   
2. Logout and login as company-b@test.com
   → Should see ONLY Company B's data
   
3. ✅ Data isolation working!
```

## 📊 Database Collections

### Collections Structure

```
companies/
  {companyId}/
    - name: string
    - owner_id: string
    - created_at: timestamp

users/
  {userId}/
    - email: string
    - username: string
    - company_id: string  ← Links user to company
    - role: string

customers/
  {customerId}/
    - company_id: string  ← For data isolation
    - name: string
    - mobile: string
    - opening_amount: number
    - closing_amount: number
    - opening_fine: number
    - closing_fine: number

sales/
  {saleId}/
    - company_id: string  ← For data isolation
    - customer_id: string
    - invoice_no: string
    - date: string
    - amount: number
    - fine: number

purchases/
  {purchaseId}/
    - company_id: string  ← For data isolation
    - customer_id: string
    - invoice_no: string
    - date: string
    - amount: number
    - fine: number

payments/
  {paymentId}/
    - company_id: string  ← For data isolation
    - customer_id: string
    - transaction_type: string
    - payment_type: string
    - amount: number

items/
  {itemId}/
    - company_id: string  ← For data isolation
    - name: string
    - description: string

expenses/
  {expenseId}/
    - company_id: string  ← For data isolation
    - category: string
    - amount: number
    - date: string
```

## 💰 Cost Analysis

### Firebase Free Tier (Spark Plan)

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

### Estimated Usage (per company)

**Small Company (10 transactions/day):**
- Reads: ~500/day
- Writes: ~50/day
- **Can support 100 companies on free tier**

**Medium Company (50 transactions/day):**
- Reads: ~2,000/day
- Writes: ~200/day
- **Can support 25 companies on free tier**

### When to Upgrade to Blaze Plan

- More than 50 active companies
- High transaction volume
- Need Cloud Functions
- Want automated backups

**Blaze Plan Cost:** Pay-as-you-go
- Firestore: $0.06 per 100,000 reads
- Hosting: $0.15 per GB bandwidth
- Very affordable for most businesses

## 🔧 Configuration Files

### Environment Variables (.env)

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Configuration (firebase.json)

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### Firestore Rules (firestore.rules)

See `firestore.rules` file for complete security rules.

## 📈 Monitoring and Analytics

### Firebase Console

**Monitor:**
- User registrations (Authentication → Users)
- Database usage (Firestore → Usage)
- Hosting traffic (Hosting → Usage)
- Errors and logs (Firestore → Logs)

### Key Metrics to Track

1. **User Growth**
   - New registrations per day
   - Active users per day
   - Companies created

2. **Database Usage**
   - Read operations
   - Write operations
   - Storage size

3. **Performance**
   - Page load times
   - API response times
   - Error rates

## 🛠️ Maintenance

### Regular Tasks

**Daily:**
- Check Firebase Console for errors
- Monitor user registrations
- Review unusual activity

**Weekly:**
- Check Firestore usage
- Review security rules effectiveness
- Test app functionality

**Monthly:**
- Update dependencies: `pnpm update`
- Review and optimize queries
- Check for Firebase SDK updates
- Backup critical data

### Backup Strategy

```bash
# Manual backup
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)

# Restore from backup
firebase firestore:import gs://your-bucket/backups/20260117
```

## 🐛 Troubleshooting

### Common Issues

**1. "Permission denied" errors**
- Check Firestore rules are deployed
- Verify user is authenticated
- Confirm company_id is set

**2. "Can't see data"**
- Check company_id in user document
- Verify documents have company_id field
- Confirm you're logged in

**3. "Build fails"**
- Clear cache: `rm -rf node_modules dist`
- Reinstall: `pnpm install`
- Rebuild: `pnpm build`

**4. "PWA not installing"**
- Ensure HTTPS (Firebase provides this)
- Check manifest.json
- Verify service worker registration

## 📚 Additional Resources

### Documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

### Project Files
- `FIREBASE_SETUP.md` - Detailed setup guide
- `FIREBASE_DEPLOYMENT.md` - Deployment instructions
- `firestore.rules` - Security rules
- `firebase.json` - Firebase configuration

## 🎓 Training Users

### For Company Admins

1. **Registration**
   - Create account with email/password
   - Set up company name
   - Becomes admin automatically

2. **Initial Setup**
   - Add company information
   - Create item catalog
   - Add customers with opening balances

3. **Daily Operations**
   - Record sales and purchases
   - Process payments and receipts
   - Track expenses
   - Generate reports

### For Company Users

1. **Login**
   - Use provided credentials
   - Access only company data

2. **Permissions**
   - View all company data
   - Create transactions
   - Generate reports
   - Cannot change company settings

## 🚀 Future Enhancements

### Planned Features

1. **Multi-Company Switching**
   - Users can belong to multiple companies
   - Switch between companies easily

2. **Role-Based Permissions**
   - Admin, Manager, Staff roles
   - Granular permissions per role

3. **Advanced Reporting**
   - Custom date ranges
   - Export to PDF/Excel
   - Email reports

4. **Notifications**
   - Push notifications
   - Email alerts
   - SMS notifications

5. **Inventory Management**
   - Stock tracking
   - Low stock alerts
   - Reorder points

## ✅ Production Checklist

Before going live:

- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Authentication enabled
- [ ] Environment variables configured
- [ ] Firestore rules deployed
- [ ] Application built and deployed
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Multi-company tested
- [ ] Data isolation verified
- [ ] PWA installation tested
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] User documentation prepared

## 📞 Support

For issues or questions:
1. Check Firebase Console for errors
2. Review Firestore rules
3. Check browser console
4. Verify environment variables
5. Test with fresh user account

---

**Built with ❤️ for Multi-Company Jewelry Business Management**

© 2026 Jewelry ERP - Firebase Multi-Company Edition

# 🚀 Quick Reference Card - Firebase Deployment

## 📋 Essential Commands

```bash
# Install dependencies
pnpm install

# Run locally
pnpm dev

# Build for production
pnpm build

# Preview build
pnpm preview

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only rules
firebase deploy --only firestore:rules

# View Firebase projects
firebase projects:list

# Open Firebase Console
firebase open
```

## 🔧 Environment Setup

**Create .env file:**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📁 Important Files

```
firestore.rules          # Security rules
firestore.indexes.json   # Database indexes
firebase.json            # Firebase config
.env                     # Environment variables
public/manifest.json     # PWA manifest
public/sw.js            # Service worker
```

## 🏢 Multi-Company Flow

```
1. User registers → Creates user document
2. User creates company → Creates company document
3. User document gets company_id
4. All data includes company_id
5. Firestore rules enforce isolation
```

## 🧪 Test Multi-Company

```bash
# Company A
Register: company-a@test.com / Test@123
Create: "Gold Jewelers A"
Add data

# Company B
Register: company-b@test.com / Test@123
Create: "Silver Jewelers B"
Add data

# Verify
Login A → See only A's data ✓
Login B → See only B's data ✓
```

## 📱 PWA Testing

**Mobile:**
1. Open in Chrome/Safari
2. "Add to Home Screen"
3. Install and test

**Desktop:**
1. Open in Chrome
2. Click install icon
3. Install and test

**Offline:**
1. Install app
2. Turn off internet
3. App still works!

## 🐛 Quick Fixes

**Build fails:**
```bash
rm -rf node_modules dist
pnpm install
pnpm build
```

**Rules not working:**
```bash
firebase deploy --only firestore:rules
```

**Config not found:**
```bash
# Check .env exists
cat .env
# Restart server
pnpm dev
```

## 📊 Firebase Console URLs

- **Console:** https://console.firebase.google.com/
- **Firestore:** Console → Firestore Database
- **Auth:** Console → Authentication
- **Hosting:** Console → Hosting
- **Rules:** Console → Firestore → Rules

## ✅ Deployment Checklist

- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Authentication enabled
- [ ] .env configured
- [ ] Dependencies installed
- [ ] Rules deployed
- [ ] App built
- [ ] App deployed
- [ ] Multi-company tested
- [ ] PWA tested

## 📚 Documentation

1. **COMPLETE_GUIDE.md** - Full guide (START HERE)
2. **FIREBASE_SETUP.md** - Detailed setup
3. **FIREBASE_DEPLOYMENT.md** - Deployment steps
4. **README_FIREBASE.md** - Architecture & features

## 🎯 Success Criteria

✅ App loads at your-app.web.app
✅ Users can register
✅ Companies can be created
✅ Data isolation works
✅ All CRUD operations work
✅ PWA installs
✅ Offline mode works
✅ Responsive on all devices

## 💰 Free Tier Limits

**Firestore:**
- 50,000 reads/day
- 20,000 writes/day
- 1 GB storage

**Hosting:**
- 360 MB/day bandwidth
- 10 GB storage

**Auth:**
- Unlimited users

## 🔄 Update Process

```bash
# 1. Make changes
# 2. Test locally
pnpm dev

# 3. Build
pnpm build

# 4. Deploy
firebase deploy --only hosting
```

## 📞 Get Help

1. Check Firebase Console → Logs
2. Check browser console (F12)
3. Review Firestore rules
4. Verify .env variables
5. Read documentation files

---

**Keep this card handy for quick reference!**

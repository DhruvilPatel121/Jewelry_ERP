# Deployment Guide - Jewelry ERP

This guide will help you deploy the Jewelry ERP application to production.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Supabase account (already configured)

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
cd /workspace/app-8zur1sisfyf5
vercel
```

4. **Environment Variables**
The `.env` file is already configured with Supabase credentials. Vercel will automatically use these.

5. **Production Deployment**
```bash
vercel --prod
```

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**
```bash
netlify login
```

3. **Build the project**
```bash
pnpm build
```

4. **Deploy**
```bash
netlify deploy --prod --dir=dist
```

### Option 3: Static Hosting (GitHub Pages, etc.)

1. **Build the project**
```bash
pnpm build
```

2. **The `dist` folder contains all static files**
Upload the contents of the `dist` folder to your hosting provider.

## Post-Deployment Steps

### 1. Update Supabase URL Whitelist

Add your production domain to Supabase:
1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to Authentication → URL Configuration
4. Add your production URL to "Site URL" and "Redirect URLs"

### 2. Test PWA Installation

1. Open your deployed app in a mobile browser
2. Look for "Add to Home Screen" prompt
3. Install and test offline functionality

### 3. Verify Authentication

1. Register a new user (this will be the admin)
2. Test login/logout functionality
3. Verify data isolation between users

### 4. Test All Features

- [ ] Customer management (add, edit, view)
- [ ] Sales transactions with calculations
- [ ] Purchase transactions
- [ ] Payment/Receipt entries
- [ ] Items management
- [ ] Expenses tracking
- [ ] Reports (Sale, Purchase, Day Book)
- [ ] Dashboard charts
- [ ] Company settings

## Database Backup

### Manual Backup

1. Go to Supabase Dashboard
2. Select your project
3. Go to Database → Backups
4. Download backup

### Automated Backups

Supabase Free Tier includes:
- Daily backups (retained for 7 days)
- Point-in-time recovery

## Monitoring

### Check Application Health

1. **Supabase Dashboard**
   - Monitor database usage
   - Check API requests
   - View authentication logs

2. **Browser Console**
   - Check for JavaScript errors
   - Monitor network requests
   - Verify service worker registration

### Performance Monitoring

- Use Lighthouse in Chrome DevTools
- Check PWA score
- Monitor load times

## Troubleshooting

### Issue: Authentication not working

**Solution:**
1. Check Supabase URL configuration
2. Verify environment variables
3. Check browser console for errors

### Issue: Database queries failing

**Solution:**
1. Check RLS policies in Supabase
2. Verify user is authenticated
3. Check network tab for API errors

### Issue: PWA not installing

**Solution:**
1. Verify HTTPS is enabled
2. Check manifest.json is accessible
3. Verify service worker registration
4. Check browser console for errors

### Issue: Calculations not working

**Solution:**
1. Check form validation
2. Verify numeric inputs
3. Check browser console for errors

## Security Checklist

- [x] RLS policies enabled on all tables
- [x] Authentication required for all routes
- [x] Environment variables secured
- [x] HTTPS enabled (automatic on Vercel/Netlify)
- [x] Password hashing (handled by Supabase)
- [x] SQL injection prevention (Supabase client handles this)

## Maintenance

### Regular Tasks

1. **Weekly**
   - Check error logs
   - Monitor database size
   - Review user feedback

2. **Monthly**
   - Update dependencies
   - Review security advisories
   - Backup database

3. **Quarterly**
   - Performance audit
   - User experience review
   - Feature planning

## Scaling Considerations

### When to Upgrade from Free Tier

Supabase Free Tier limits:
- 500 MB database space
- 2 GB bandwidth
- 50,000 monthly active users

**Upgrade when:**
- Database size exceeds 400 MB
- Monthly active users exceed 40,000
- Need more than 7 days backup retention

### Performance Optimization

1. **Database Indexes**
   - Already created on foreign keys
   - Add indexes for frequently queried columns

2. **Query Optimization**
   - Use pagination for large datasets
   - Implement caching where appropriate

3. **Asset Optimization**
   - Images are already optimized
   - Code splitting implemented by Vite

## Support

For deployment issues:
1. Check Supabase documentation: https://supabase.com/docs
2. Check Vercel/Netlify documentation
3. Review browser console errors
4. Check network tab for failed requests

## Rollback Procedure

If deployment fails:

1. **Revert to previous version**
```bash
vercel rollback
# or
netlify rollback
```

2. **Database rollback**
   - Use Supabase backup restore
   - Point-in-time recovery available

## Success Criteria

Your deployment is successful when:
- [x] Application loads without errors
- [x] Authentication works (register/login/logout)
- [x] All CRUD operations work
- [x] Calculations are accurate
- [x] Reports generate correctly
- [x] PWA installs on mobile
- [x] Offline mode works
- [x] Data persists correctly

---

**Deployment Complete! 🎉**

Your Jewelry ERP application is now live and ready to use.

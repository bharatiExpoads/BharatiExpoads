# Google Maps Integration - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Google Maps API key obtained from Google Cloud Console
- [ ] Maps JavaScript API enabled in Google Cloud
- [ ] Geocoding API enabled (for address conversion)
- [ ] API key restrictions configured (HTTP referrers)
- [ ] Billing enabled on Google Cloud (required even for free tier)

### 2. Backend Configuration
- [ ] `backend/.env` contains `GOOGLE_MAPS_API_KEY`
- [ ] Database migration run: `npx prisma migrate dev`
- [ ] Hoarding table has `latitude` and `longitude` columns
- [ ] Test data has coordinates (or geocoding script run)
- [ ] Backend server starts without errors
- [ ] API endpoints accessible: `/admin/campaigns/:id/map-data`
- [ ] API endpoints accessible: `/admin/campaigns/:id/share-map-link`

### 3. Frontend Configuration
- [ ] `frontend/.env` contains `REACT_APP_GOOGLE_MAPS_API_KEY`
- [ ] Package installed: `@react-google-maps/api` (check package.json)
- [ ] `CampaignMap.jsx` component exists in `src/components/`
- [ ] `CampaignDetails.jsx` imports `CampaignMap`
- [ ] "See on Map" button visible on Campaign Details page
- [ ] "Share Map" button visible on Campaign Details page
- [ ] Frontend builds without errors: `npm run build`

### 4. Database
- [ ] Hoarding coordinates populated (manually or via script)
- [ ] At least 1 campaign has hoardings with coordinates
- [ ] Test queries work: `SELECT latitude, longitude FROM "Hoarding" WHERE latitude IS NOT NULL`
- [ ] No NULL values in critical coordinate data (or handle gracefully)

### 5. Testing
- [ ] Map modal opens on "See on Map" click
- [ ] Markers display correctly on map
- [ ] InfoWindow shows hoarding details on marker click
- [ ] Share link copies to clipboard
- [ ] Shared link opens in Google Maps
- [ ] "No location data" message shows for campaigns without coordinates
- [ ] Console has no critical errors
- [ ] Network tab shows successful API calls

---

## 🚀 Deployment Steps

### For Development

#### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

#### Step 2: Configure Environment
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and add GOOGLE_MAPS_API_KEY

# Frontend
cd frontend
cp .env.example .env
# Edit .env and add REACT_APP_GOOGLE_MAPS_API_KEY
```

#### Step 3: Database Migration
```bash
cd backend
npx prisma migrate dev --name add_hoarding_coordinates
npx prisma generate
```

#### Step 4: Geocode Hoardings (Optional)
```bash
cd backend
node scripts/geocode-hoardings.js
```

#### Step 5: Start Services
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

---

### For Production

#### Step 1: Update API Key Restrictions
In Google Cloud Console:
1. Go to Credentials
2. Edit your API key
3. Application restrictions:
   - Set to "HTTP referrers (websites)"
   - Add: `https://yourdomain.com/*`
   - Add: `https://www.yourdomain.com/*`
4. API restrictions:
   - Select "Restrict key"
   - Enable: Maps JavaScript API
   - Enable: Geocoding API (if using script)

#### Step 2: Environment Variables
```bash
# Production Backend (.env)
DATABASE_URL="your_production_database_url"
JWT_SECRET="your_secure_jwt_secret"
PORT=5000
GOOGLE_MAPS_API_KEY=your_production_api_key

# Production Frontend (.env.production)
REACT_APP_GOOGLE_MAPS_API_KEY=your_production_api_key
REACT_APP_API_URL=https://api.yourdomain.com
```

#### Step 3: Build Frontend
```bash
cd frontend
npm run build
# This creates optimized production build in /build folder
```

#### Step 4: Deploy Backend
```bash
cd backend
# Run migrations on production database
npx prisma migrate deploy

# Start production server (using PM2 or similar)
pm2 start server.js --name hoarding-backend
```

#### Step 5: Deploy Frontend
- Upload `build` folder to hosting (Netlify, Vercel, AWS S3, etc.)
- Configure hosting to serve React SPA (redirect all to index.html)

#### Step 6: Verify Deployment
- [ ] Visit production URL
- [ ] Test map functionality
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Verify API calls use HTTPS
- [ ] Check Google Maps API quota usage

---

## 🔒 Security Checklist

### API Key Security
- [ ] API key stored in environment variables (not hardcoded)
- [ ] `.env` files in `.gitignore`
- [ ] API key has HTTP referrer restrictions
- [ ] API key has API restrictions (only necessary APIs)
- [ ] Billing alerts set up in Google Cloud
- [ ] Daily spend limits configured

### Application Security
- [ ] HTTPS enabled on production
- [ ] CORS configured properly
- [ ] JWT tokens validated on backend
- [ ] Authentication required for map endpoints
- [ ] Rate limiting enabled (if needed)
- [ ] SQL injection prevented (using Prisma ORM)

---

## 📊 Monitoring Setup

### Google Cloud Console
- [ ] Set up billing alerts ($10, $50, $100)
- [ ] Enable quota alerts
- [ ] Monitor API usage daily (first week)
- [ ] Check for unusual activity

### Application Monitoring
- [ ] Error tracking (Sentry, LogRocket, etc.)
- [ ] Performance monitoring
- [ ] User analytics (optional)
- [ ] API response time tracking

### Logs to Monitor
```bash
# Backend logs
- "Error fetching map data"
- "Failed to generate shareable map link"
- "Geocoding failed"

# Frontend console
- Google Maps API errors
- Failed fetch requests
- Invalid coordinates warnings
```

---

## 🐛 Rollback Plan

If issues occur after deployment:

### Quick Rollback (5 minutes)
1. Revert database migration:
   ```bash
   npx prisma migrate resolve --rolled-back migration_name
   ```

2. Remove new routes from `backend/routes/admin.js`

3. Revert frontend changes or deploy previous build

### Full Rollback (15 minutes)
1. Restore database from backup
2. Deploy previous backend version
3. Deploy previous frontend build
4. Clear application cache
5. Notify users of temporary service interruption

---

## 📈 Post-Deployment Tasks

### Day 1
- [ ] Monitor Google Maps API usage
- [ ] Check error logs for issues
- [ ] Test on different browsers
- [ ] Verify mobile responsiveness
- [ ] Gather user feedback

### Week 1
- [ ] Review API costs (should be $0 if under free tier)
- [ ] Check performance metrics
- [ ] Fix any reported bugs
- [ ] Document any issues found

### Month 1
- [ ] Analyze usage patterns
- [ ] Optimize if needed
- [ ] Consider additional features
- [ ] Review Google Cloud costs

---

## 🎯 Success Metrics

### Technical Metrics
- ✅ Map loads in < 2 seconds
- ✅ API response time < 500ms
- ✅ No JavaScript errors in console
- ✅ 99%+ uptime
- ✅ Mobile responsive

### Business Metrics
- ✅ Users click "See on Map" regularly
- ✅ Shared links are used
- ✅ Positive user feedback
- ✅ Reduced manual location queries
- ✅ Improved client presentations

### Cost Metrics
- ✅ Stay within $200/month free tier
- ✅ < $50/month if exceeding free tier
- ✅ Cost per map load < $0.01

---

## 📞 Support Contacts

### Google Maps Support
- Documentation: https://developers.google.com/maps
- Support: https://cloud.google.com/support
- Community: Stack Overflow (tag: google-maps)

### Internal Team
- Backend Developer: [Your Contact]
- Frontend Developer: [Your Contact]
- Database Admin: [Your Contact]
- DevOps: [Your Contact]

---

## 📝 Deployment Record

### Deployment Information
- **Date**: _______________
- **Version**: 1.0.0
- **Deployed By**: _______________
- **Backend Commit**: _______________
- **Frontend Commit**: _______________

### Checklist Completion
- **Environment**: ⬜ Dev ⬜ Staging ⬜ Production
- **Database Migration**: ⬜ Success ⬜ Failed
- **Backend Deployment**: ⬜ Success ⬜ Failed
- **Frontend Deployment**: ⬜ Success ⬜ Failed
- **Testing**: ⬜ Passed ⬜ Issues Found

### Issues Encountered
```
[List any issues and their resolutions]
```

### Next Steps
```
[List any follow-up tasks]
```

---

## 🎉 Launch Announcement Template

**Subject**: New Feature: Interactive Maps for Campaign Locations

**Message**:
```
Hi Team,

We're excited to announce a new feature in the Hoarding Campaign Management System:

🗺️ **Interactive Campaign Maps**

What's New:
• View all campaign hoarding locations on an interactive Google Map
• Click markers to see detailed hoarding information
• Share map links with clients (no login required!)
• Color-coded markers by hoarding type

How to Use:
1. Open any campaign details page
2. Click "See on Map" (green button)
3. Explore locations and share with team/clients

Benefits:
✓ Visual overview of campaign spread
✓ Easy location sharing with clients
✓ Better route planning for site visits
✓ Professional client presentations

Questions? Contact [Support Contact]

Happy Mapping! 🗺️
[Your Name]
```

---

**Remember**: Test thoroughly before deploying to production! ✅

Good luck with your deployment! 🚀

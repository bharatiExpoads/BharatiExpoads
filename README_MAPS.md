# 🗺️ Google Maps Integration - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Quick Start](#quick-start)
4. [Detailed Setup](#detailed-setup)
5. [How to Use](#how-to-use)
6. [Files Modified/Created](#files-modifiedcreated)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)
9. [Additional Resources](#additional-resources)

---

## 🎯 Overview

This Google Maps integration allows you to:
- **View campaign locations** on an interactive map
- **Share map links** with anyone (no login required)
- **Visualize hoarding distribution** across the city
- **Improve client presentations** with professional maps
- **Plan site visits** efficiently

### What's Included
- ✅ Backend API endpoints for map data
- ✅ Interactive Google Maps React component
- ✅ Campaign Details page integration
- ✅ Shareable Google Maps links
- ✅ Automatic geocoding script
- ✅ Complete documentation

---

## ✨ Features

### 1. Interactive Campaign Map
![Map Preview](https://via.placeholder.com/800x400?text=Campaign+Map+Preview)

- **Numbered Markers**: Each hoarding shown with a number (1, 2, 3...)
- **Color-Coded**: Different colors for different hoarding types
- **InfoWindows**: Click markers to see detailed information
- **Auto-Centering**: Map centers based on all locations
- **Location List**: Scrollable list below map for quick navigation

### 2. Shareable Links
- One-click copy to clipboard
- Opens in Google Maps app/browser
- No authentication required
- Perfect for sharing with clients

### 3. Marker Colors by Type
- 🔴 **Red**: Standard Hoarding
- 🔵 **Blue**: LED
- 🟢 **Green**: Promotion Vehicle
- 🟣 **Purple**: Bus Queue Shelter
- 🟠 **Orange**: Bus Branding
- 🟡 **Yellow**: Pole Kiosk

---

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- PostgreSQL database running
- Google Cloud account (free tier)

### 5-Minute Setup

```bash
# 1. Install package
cd frontend
npm install @react-google-maps/api

# 2. Get Google Maps API Key
# Visit: https://console.cloud.google.com/google/maps-apis
# Enable: Maps JavaScript API
# Create: API Key

# 3. Configure environment
echo "REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_KEY" > frontend/.env
echo "GOOGLE_MAPS_API_KEY=YOUR_KEY" >> backend/.env

# 4. Run database migration
cd backend
npx prisma migrate dev --name add_hoarding_coordinates

# 5. Add coordinates to hoardings
node scripts/geocode-hoardings.js

# 6. Start application
npm start
```

That's it! Visit any campaign and click "See on Map" 🎉

---

## 📚 Detailed Setup

### Step 1: Google Cloud Setup

1. **Create/Select Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Name: "Hoarding Management" (or your choice)

2. **Enable APIs**
   - Navigate to "APIs & Services" → "Library"
   - Search and enable:
     - ✅ Maps JavaScript API
     - ✅ Geocoding API (optional, for batch conversion)

3. **Create API Key**
   - Go to "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX`)

4. **Secure API Key** (Important!)
   - Click "Restrict Key"
   - **Application restrictions**:
     - Choose "HTTP referrers (websites)"
     - Add: `http://localhost:3000/*` (development)
     - Add: `https://yourdomain.com/*` (production)
   - **API restrictions**:
     - Choose "Restrict key"
     - Select: "Maps JavaScript API"
     - Select: "Geocoding API" (if using script)
   - Click "Save"

5. **Enable Billing** (Required even for free tier)
   - Go to "Billing"
   - Set up billing account (credit card required)
   - You get $200 free credit/month
   - Set budget alerts at $10, $50, $100

### Step 2: Backend Configuration

```bash
# Navigate to backend
cd backend

# Update .env file
nano .env
# Add this line:
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX

# Run database migration
npx prisma migrate dev --name add_hoarding_coordinates

# Expected output:
# ✔ Generated Prisma Client
# ✔ Applied migration: add_hoarding_coordinates

# Verify migration
npx prisma studio
# Check Hoarding model has latitude and longitude fields
```

### Step 3: Frontend Configuration

```bash
# Navigate to frontend
cd frontend

# Create .env file
nano .env
# Add:
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX

# Install package
npm install @react-google-maps/api

# Verify installation
npm list @react-google-maps/api
# Should show: @react-google-maps/api@2.20.7 (or later)
```

### Step 4: Add Coordinates to Hoardings

**Option A: Automatic (Recommended)**
```bash
cd backend
node scripts/geocode-hoardings.js

# This will:
# - Find all hoardings without coordinates
# - Convert addresses to lat/lng using Google Geocoding API
# - Update database automatically
# - Show progress for each hoarding
```

**Option B: Manual**
```sql
-- Get coordinates from Google Maps:
-- 1. Open Google Maps
-- 2. Right-click on location
-- 3. Click coordinates to copy
-- 4. Run SQL:

UPDATE "Hoarding" 
SET latitude = 28.6304, longitude = 77.2177 
WHERE id = 'your-hoarding-id';
```

**Option C: Batch SQL**
```sql
-- Sample coordinates for Delhi landmarks:

UPDATE "Hoarding" SET latitude = 28.6304, longitude = 77.2177 
WHERE location LIKE '%Connaught Place%';

UPDATE "Hoarding" SET latitude = 28.6129, longitude = 77.2295 
WHERE location LIKE '%India Gate%';

UPDATE "Hoarding" SET latitude = 28.5244, longitude = 77.1855 
WHERE location LIKE '%Qutub Minar%';

UPDATE "Hoarding" SET latitude = 28.6562, longitude = 77.2410 
WHERE location LIKE '%Red Fort%';
```

### Step 5: Start Application

```bash
# Terminal 1 - Backend
cd backend
npm start
# Server running on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm start
# App running on http://localhost:3000
```

---

## 💡 How to Use

### For Admins

#### Viewing Campaign Map

1. **Navigate to Campaign**
   - Go to Campaign Dashboard
   - Click "See campaigns"
   - Select any campaign

2. **Open Map**
   - On Campaign Details page
   - Click **"See on Map"** button (green, next to billing)
   - Map modal opens

3. **Interact with Map**
   - **Pan**: Click and drag map
   - **Zoom**: Scroll wheel or +/- buttons
   - **Click Marker**: View hoarding details
   - **Click Location**: In list below map to zoom to that location

4. **Close Map**
   - Click X button (top right)
   - Or press ESC key

#### Sharing Map

1. **Generate Link**
   - On Campaign Details page
   - Click **"Share Map"** button (orange)
   - Link automatically copied to clipboard
   - Toast notification appears

2. **Share Link**
   - Paste in email, WhatsApp, SMS, etc.
   - Recipient can click link
   - Opens in Google Maps
   - No login required!

3. **Use Cases**
   - Share with clients for approval
   - Send to site visit teams
   - Include in proposals/presentations
   - Share with stakeholders

### For Clients (Recipients)

1. **Receive Link**
   - Get link via email/WhatsApp/SMS
   - Format: `https://www.google.com/maps/search/?api=1&query=...`

2. **Open Link**
   - Click link
   - Opens in:
     - Google Maps app (if on mobile)
     - Google Maps website (if on desktop)

3. **View Locations**
   - See all campaign hoarding locations
   - Can get directions
   - Can explore nearby area
   - Can save locations

---

## 📁 Files Modified/Created

### Backend

#### Modified Files
```
backend/
├── prisma/
│   └── schema.prisma                    # Added latitude & longitude to Hoarding
├── controllers/
│   └── campaignController.js            # Added getMapData & generateShareableMapLink
├── routes/
│   └── admin.js                         # Added map routes
└── .env                                  # Added GOOGLE_MAPS_API_KEY
```

#### Created Files
```
backend/
└── scripts/
    └── geocode-hoardings.js             # NEW: Batch geocoding script
```

### Frontend

#### Modified Files
```
frontend/
├── src/
│   └── pages/
│       └── admin/
│           └── CampaignDetails.jsx      # Added map buttons & modal
└── .env                                  # Added REACT_APP_GOOGLE_MAPS_API_KEY
```

#### Created Files
```
frontend/
├── src/
│   └── components/
│       └── CampaignMap.jsx              # NEW: Map component
└── .env.example                          # NEW: Environment template
```

### Documentation

```
demo10/
├── GOOGLE_MAPS_SETUP.md                 # NEW: Setup guide
├── MAPS_QUICK_REFERENCE.md              # NEW: Quick reference
├── IMPLEMENTATION_SUMMARY.md            # NEW: Implementation details
├── API_TESTING_GUIDE.md                 # NEW: Testing guide
├── DEPLOYMENT_CHECKLIST.md              # NEW: Deployment checklist
├── README_MAPS.md                       # NEW: This file
└── TODO.md                               # Updated with completion status
```

---

## 🔌 API Documentation

### Endpoint 1: Get Map Data

**URL**: `GET /admin/campaigns/:id/map-data`

**Authentication**: Required (JWT token)

**Description**: Fetches all hoarding locations for a specific campaign

**Request**:
```bash
GET /admin/campaigns/1/map-data
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "campaignId": 1,
  "campaignNumber": "CMP-20250101-1234",
  "customerName": "ABC Company",
  "locations": [
    {
      "id": "hoarding-uuid-1",
      "location": "Connaught Place, Delhi",
      "latitude": 28.6304,
      "longitude": 77.2177,
      "width": 40,
      "height": 20,
      "totalSqFt": 800,
      "type": "Hoarding",
      "illumination": true
    },
    {
      "id": "hoarding-uuid-2",
      "location": "India Gate, Delhi",
      "latitude": 28.6129,
      "longitude": 77.2295,
      "width": 30,
      "height": 15,
      "totalSqFt": 450,
      "type": "LED",
      "illumination": true
    }
  ]
}
```

**Error Responses**:
- `404`: Campaign not found
- `401`: Unauthorized (invalid/missing token)
- `500`: Server error

---

### Endpoint 2: Generate Shareable Map Link

**URL**: `GET /admin/campaigns/:id/share-map-link`

**Authentication**: Required (JWT token)

**Description**: Generates shareable Google Maps URL for campaign locations

**Request**:
```bash
GET /admin/campaigns/1/share-map-link
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "campaignNumber": "CMP-20250101-1234",
  "totalLocations": 2,
  "shareableLink": "https://www.google.com/maps/search/?api=1&query=28.6217,77.2231",
  "googleMapsUrl": "https://www.google.com/maps/dir/?api=1&destination=28.6304,77.2177&travelmode=driving",
  "locations": [
    {
      "number": 1,
      "location": "Connaught Place, Delhi",
      "latitude": 28.6304,
      "longitude": 77.2177
    },
    {
      "number": 2,
      "location": "India Gate, Delhi",
      "latitude": 28.6129,
      "longitude": 77.2295
    }
  ]
}
```

**Error Responses**:
- `404`: Campaign not found
- `400`: No hoardings with location data found
- `401`: Unauthorized
- `500`: Server error

---

## 🐛 Troubleshooting

### Map Not Loading

**Symptoms**: Blank gray map or loading forever

**Solutions**:
1. Check API key in `.env` file
   ```bash
   cat frontend/.env
   # Should show: REACT_APP_GOOGLE_MAPS_API_KEY=AIza...
   ```

2. Verify API is enabled
   - Go to Google Cloud Console
   - Navigate to "APIs & Services" → "Library"
   - Search "Maps JavaScript API"
   - Should show "API enabled"

3. Check browser console
   - Press F12
   - Look for errors containing "Google Maps"
   - Common error: "This page can't load Google Maps correctly"
   - Solution: Enable billing on Google Cloud

4. Verify API key restrictions
   - Allow `http://localhost:3000/*` for development
   - Allow your production domain for production

---

### "No location data available" Message

**Symptoms**: Message instead of map

**Cause**: Hoardings don't have coordinates

**Solutions**:
1. Run geocoding script:
   ```bash
   cd backend
   node scripts/geocode-hoardings.js
   ```

2. Or add coordinates manually:
   ```sql
   UPDATE "Hoarding" 
   SET latitude = 28.6304, longitude = 77.2177 
   WHERE id = 'hoarding-id';
   ```

3. Verify coordinates exist:
   ```sql
   SELECT COUNT(*) FROM "Hoarding" 
   WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
   ```

---

### Share Link Not Working

**Symptoms**: Copied link doesn't open properly

**Solutions**:
1. Check if coordinates are valid:
   - Latitude: -90 to 90
   - Longitude: -180 to 180

2. Verify backend API:
   ```bash
   curl http://localhost:5000/admin/campaigns/1/share-map-link \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. Test with simple link:
   ```
   https://www.google.com/maps/search/?api=1&query=28.6304,77.2177
   ```

---

### Markers Not Showing

**Symptoms**: Map loads but no markers appear

**Solutions**:
1. Check if locations array has data:
   ```javascript
   console.log(mapData.locations);
   // Should show array of objects with lat/lng
   ```

2. Verify coordinates are numbers (not strings):
   ```javascript
   console.log(typeof location.latitude); // Should be "number"
   ```

3. Check zoom level:
   - May need to zoom out to see markers
   - Try setting zoom to 10 or lower

---

### API Rate Limiting

**Symptoms**: Some locations not geocoding

**Solutions**:
1. Script has built-in 100ms delay between requests
2. If still hitting limits, increase delay:
   ```javascript
   // In geocode-hoardings.js
   await delay(200); // Increase from 100 to 200ms
   ```

3. Process in batches:
   ```bash
   node scripts/geocode-hoardings.js --specific id1 id2 id3
   ```

---

### Performance Issues

**Symptoms**: Map slow to load or laggy

**Solutions**:
1. Reduce marker count (clustering coming soon)
2. Optimize images in InfoWindows
3. Lazy load map component:
   ```javascript
   const CampaignMap = React.lazy(() => import('./CampaignMap'));
   ```

4. Check network tab for slow API calls

---

## 📚 Additional Resources

### Documentation Files
- [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) - Complete setup guide
- [MAPS_QUICK_REFERENCE.md](./MAPS_QUICK_REFERENCE.md) - Quick reference
- [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) - API testing examples
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment guide
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical details

### External Links
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Geocoding API Docs](https://developers.google.com/maps/documentation/geocoding)
- [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)

### Video Tutorials
- [Getting Started with Google Maps API](https://www.youtube.com/watch?v=Zxf1mnP5zcw)
- [React Google Maps Tutorial](https://www.youtube.com/watch?v=WZcxJGmLbSo)

### Community Support
- [Stack Overflow - Google Maps](https://stackoverflow.com/questions/tagged/google-maps)
- [Google Maps Platform Support](https://cloud.google.com/maps-platform/support)

---

## 💰 Cost Information

### Free Tier
- **$200 free credit** per month
- **28,571 map loads** free per month ($7 per 1,000 loads)
- **40,000 geocoding requests** free per month ($5 per 1,000)

### This Project Usage
- **Estimated map loads**: 100-500/day
- **Estimated cost**: $0/month (stays within free tier)
- **One-time geocoding**: $0.05-$0.50 (one-time setup)

### When You'll Pay
- If exceeding 28,000 map loads/month
- Typically for very high-traffic websites
- Monitor usage in Google Cloud Console

### Cost Optimization
- Use static maps for thumbnails (cheaper)
- Implement caching for map data
- Use clustering for many markers
- Set up budget alerts

---

## 🎓 Learning Resources

### Concepts to Understand
1. **Latitude & Longitude**
   - Latitude: -90 (South Pole) to 90 (North Pole)
   - Longitude: -180 (West) to 180 (East)
   - Delhi is approximately: 28.6°N, 77.2°E

2. **Geocoding**
   - Converting addresses to coordinates
   - Example: "Connaught Place, Delhi" → (28.6304, 77.2177)

3. **Reverse Geocoding**
   - Converting coordinates to addresses
   - Example: (28.6304, 77.2177) → "Connaught Place, Delhi"

4. **Map Projections**
   - How 3D earth is shown on 2D map
   - Google Maps uses Web Mercator projection

### Code Examples

#### Simple Map Component
```jsx
import { GoogleMap, LoadScript } from '@react-google-maps/api';

function SimpleMap() {
  return (
    <LoadScript googleMapsApiKey="YOUR_KEY">
      <GoogleMap
        center={{ lat: 28.6139, lng: 77.2090 }}
        zoom={12}
        mapContainerStyle={{ width: '100%', height: '400px' }}
      />
    </LoadScript>
  );
}
```

#### Add Marker
```jsx
import { Marker } from '@react-google-maps/api';

<Marker
  position={{ lat: 28.6139, lng: 77.2090 }}
  label="1"
  onClick={() => alert('Marker clicked!')}
/>
```

#### Custom InfoWindow
```jsx
import { InfoWindow } from '@react-google-maps/api';

<InfoWindow position={{ lat: 28.6139, lng: 77.2090 }}>
  <div>
    <h3>Location Name</h3>
    <p>Details here</p>
  </div>
</InfoWindow>
```

---

## 🚀 Next Steps

### Immediate
1. Complete setup using Quick Start guide
2. Test map functionality
3. Add coordinates to all hoardings
4. Train team on how to use

### Short Term (1-2 weeks)
1. Gather user feedback
2. Fix any bugs found
3. Optimize performance if needed
4. Add to user documentation

### Long Term (1-3 months)
1. Add marker clustering for many locations
2. Implement route planning
3. Add distance calculations
4. Create mobile app with maps
5. Add heatmap visualization

---

## 📞 Support

### Need Help?
1. Check troubleshooting section above
2. Review documentation files
3. Check browser console for errors
4. Search Stack Overflow
5. Contact development team

### Reporting Issues
When reporting issues, include:
- Browser and version
- Console error messages
- Network tab screenshot
- Steps to reproduce
- Expected vs actual behavior

---

## ✅ Quick Checklist

Before going live, ensure:
- [ ] Google Maps API key obtained and configured
- [ ] Database migration completed
- [ ] Coordinates added to hoardings
- [ ] Map displays correctly in development
- [ ] Share link functionality tested
- [ ] API key restrictions configured
- [ ] Billing alerts set up
- [ ] Team trained on feature
- [ ] Documentation reviewed
- [ ] Production deployment tested

---

**Version**: 1.0.0  
**Last Updated**: November 1, 2025  
**Status**: ✅ Complete and Ready for Use

Happy Mapping! 🗺️🎉

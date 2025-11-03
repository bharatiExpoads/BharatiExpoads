# Google Maps Integration - Quick Reference

## 🎯 What Was Added

### Backend Changes
1. **Database Schema** (`backend/prisma/schema.prisma`)
   - Added `latitude` (Float?) to Hoarding model
   - Added `longitude` (Float?) to Hoarding model

2. **API Endpoints** (`backend/controllers/campaignController.js`)
   - `GET /admin/campaigns/:id/map-data` - Returns all hoarding locations for a campaign
   - `GET /admin/campaigns/:id/share-map-link` - Generates shareable Google Maps URL

3. **Routes** (`backend/routes/admin.js`)
   - Added map data routes to admin router

4. **Geocoding Script** (`backend/scripts/geocode-hoardings.js`)
   - Automatically converts hoarding addresses to coordinates
   - Uses Google Geocoding API

### Frontend Changes
1. **New Component** (`frontend/src/components/CampaignMap.jsx`)
   - Interactive Google Maps with markers
   - InfoWindows with hoarding details
   - Location list below map
   - Color-coded markers by type

2. **Updated Page** (`frontend/src/pages/admin/CampaignDetails.jsx`)
   - Added "See on Map" button (green)
   - Added "Share Map" button (orange)
   - Added MapModal component
   - Integrated map functionality

3. **Environment Setup** (`frontend/.env.example`)
   - Template for Google Maps API key

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Package
```bash
cd frontend
npm install @react-google-maps/api
```

### Step 2: Get API Key
1. Visit: https://console.cloud.google.com/google/maps-apis
2. Enable "Maps JavaScript API"
3. Create credentials → API Key
4. Copy the key

### Step 3: Configure
```bash
cd frontend
echo "REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE" > .env
```

### Step 4: Update Database
```bash
cd backend
npx prisma migrate dev --name add_hoarding_coordinates
```

### Step 5: Add Coordinates (Optional - Auto Geocoding)
```bash
cd backend
# Add GOOGLE_MAPS_API_KEY to backend/.env
node scripts/geocode-hoardings.js
```

## 📍 How It Works

### User Flow:
1. User opens Campaign Details page
2. Clicks "See on Map" button
3. Modal opens with interactive Google Maps
4. All campaign hoardings shown as numbered markers
5. Click marker to see hoarding details
6. Click "Share Map" to copy shareable link
7. Share link with anyone (no login needed)

### Data Flow:
```
Campaign Details Page
    ↓
Click "See on Map"
    ↓
Fetch /admin/campaigns/:id/map-data
    ↓
Returns: { campaignNumber, customerName, locations[] }
    ↓
CampaignMap Component renders Google Map
    ↓
Markers placed at (latitude, longitude)
```

### Shareable Link Flow:
```
Click "Share Map"
    ↓
Fetch /admin/campaigns/:id/share-map-link
    ↓
Generate Google Maps URL with all markers
    ↓
Copy to clipboard
    ↓
Anyone can open link in browser
```

## 🎨 UI Features

### Map Modal
- Full-screen modal with close button
- Campaign header with name and location count
- Interactive Google Maps
- Location list with click-to-zoom
- Share link section with copy button

### Markers
- Numbered markers (1, 2, 3...)
- Color-coded by hoarding type
- Click to show InfoWindow with:
  - Location name
  - Size dimensions
  - Square footage
  - Hoarding type
  - Illumination status

### Controls
- Zoom in/out
- Map type selector
- Full-screen mode
- Street view (disabled by default)

## 🔧 API Response Examples

### Map Data Response
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
    }
  ]
}
```

### Share Link Response
```json
{
  "campaignNumber": "CMP-20250101-1234",
  "totalLocations": 5,
  "shareableLink": "https://www.google.com/maps/search/?api=1&query=28.6304,77.2177",
  "googleMapsUrl": "https://www.google.com/maps/dir/?api=1&destination=28.6304,77.2177",
  "locations": [
    {
      "number": 1,
      "location": "Connaught Place, Delhi",
      "latitude": 28.6304,
      "longitude": 77.2177
    }
  ]
}
```

## 🐛 Troubleshooting

### "Map not loading"
- Check if API key is in `.env` file
- Verify API key has Maps JavaScript API enabled
- Check browser console for errors

### "No location data available"
- Hoardings need latitude/longitude values
- Run geocoding script: `node scripts/geocode-hoardings.js`
- Or manually add coordinates to hoardings

### "Failed to fetch map data"
- Check backend is running
- Verify API endpoint exists in routes
- Check authentication token is valid

## 💡 Tips

1. **Get Coordinates Quickly**
   - Right-click on Google Maps
   - Click coordinates to copy
   - Format: latitude (first), longitude (second)

2. **Bulk Update Coordinates**
   ```sql
   UPDATE "Hoarding" 
   SET latitude = 28.6304, longitude = 77.2177 
   WHERE id = 'hoarding-id';
   ```

3. **Test Map Locally**
   - Use `http://localhost:3000` in API restrictions
   - Add your local IP if testing on mobile

4. **Production Deployment**
   - Add production domain to API restrictions
   - Use environment variables for API key
   - Monitor usage in Google Cloud Console

## 📊 Cost (Google Maps API)

- **Free Tier**: $200/month credit
- **Maps JavaScript API**: $7 per 1,000 loads
- **Typical Usage**: ~28,000 free loads/month
- **This Project**: Likely stays in free tier

## 🔒 Security Best Practices

1. ✅ API key in environment variables (not committed)
2. ✅ API key restrictions in Google Cloud Console
3. ✅ HTTP referrer restrictions
4. ✅ API restrictions (only Maps JavaScript API)
5. ✅ Monitor usage regularly

## 📚 Resources

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Geocoding API](https://developers.google.com/maps/documentation/geocoding)

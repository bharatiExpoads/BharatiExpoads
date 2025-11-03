# Google Maps Integration Setup Guide

## Overview
This guide will help you set up Google Maps integration for viewing campaign hoarding locations on an interactive map.

## Features Implemented
1. ✅ **Database Schema Updated** - Added `latitude` and `longitude` fields to Hoarding model
2. ✅ **Backend API Endpoints** - Two new endpoints:
   - `GET /admin/campaigns/:id/map-data` - Fetches all hoarding locations for a campaign
   - `GET /admin/campaigns/:id/share-map-link` - Generates shareable Google Maps link
3. ✅ **Campaign Map Component** - Interactive Google Maps with markers for each hoarding
4. ✅ **Campaign Details Integration** - "See on Map" and "Share Map" buttons added
5. ✅ **Shareable Links** - Anyone can view the map via generated Google Maps link

## Setup Instructions

### 1. Install Required Packages

```bash
cd frontend
npm install @react-google-maps/api
```

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API (optional, for address to coordinates conversion)
4. Go to "Credentials" and create an API key
5. Restrict your API key (recommended):
   - Application restrictions: HTTP referrers (websites)
   - Add your domain: `http://localhost:3000/*` for development
   - API restrictions: Select "Maps JavaScript API"

### 3. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Maps API key:

```
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4. Update Database Schema

Run Prisma migration to add latitude and longitude fields:

```bash
cd backend
npx prisma migrate dev --name add_hoarding_coordinates
```

### 5. Add Location Coordinates to Hoardings

You need to add latitude and longitude to your existing hoardings. You can:

**Option A: Manual Update**
```sql
UPDATE "Hoarding" 
SET latitude = 28.6139, longitude = 77.2090 
WHERE location = 'Connaught Place, Delhi';
```

**Option B: Use Geocoding API** (recommended for many locations)
- Create a script to convert addresses to coordinates using Google Geocoding API
- Example script location: `backend/scripts/geocode-hoardings.js`

### 6. Restart the Application

```bash
# Backend
cd backend
npm start

# Frontend (in new terminal)
cd frontend
npm start
```

## How to Use

### View Campaign on Map

1. Navigate to any campaign details page
2. Click the **"See on Map"** button (green button near billing section)
3. A modal will open showing:
   - Google Maps with all hoarding locations as markers
   - Numbered markers (1, 2, 3...) for each hoarding
   - Click on markers to see hoarding details
   - List of all locations below the map

### Share Map with Others

1. On campaign details page, click **"Share Map"** button (orange)
2. A shareable Google Maps link is automatically copied to clipboard
3. Share this link with anyone - no login required
4. The link opens in Google Maps showing all campaign locations

### Map Features

- **Interactive Markers**: Click to see hoarding details
  - Location name
  - Size (width × height)
  - Total square feet
  - Hoarding type
  - Illumination status

- **Color-Coded Markers** by hoarding type:
  - 🔴 Red: Standard Hoarding
  - 🔵 Blue: LED
  - 🟢 Green: Promotion Vehicle
  - 🟣 Purple: Bus Queue Shelter
  - 🟠 Orange: Bus Branding
  - 🟡 Yellow: Pole Kiosk

- **Auto Centering**: Map automatically centers based on all hoarding locations
- **Zoom Control**: Adjust zoom level based on location spread

## Updating Hoarding Coordinates

When creating or editing hoardings, add latitude and longitude:

### Via API:
```javascript
POST /admin/hoardings
{
  "location": "India Gate, Delhi",
  "latitude": 28.6129,
  "longitude": 77.2295,
  // ... other fields
}
```

### Finding Coordinates:
1. Open Google Maps
2. Right-click on the location
3. Click on the coordinates to copy
4. First number is latitude, second is longitude

## Troubleshooting

### Map Not Loading
- Check if Google Maps API key is correctly set in `.env`
- Verify API key has Maps JavaScript API enabled
- Check browser console for errors

### "No location data available" message
- Hoardings in the campaign need latitude and longitude values
- Update hoarding records with coordinates

### Shareable Link Not Working
- Ensure hoardings have valid coordinates
- Check if backend API endpoint is accessible

## API Key Security

**Important**: 
- Never commit `.env` file to git (it's in `.gitignore`)
- Use API key restrictions in Google Cloud Console
- For production, use domain restrictions
- Monitor API usage in Google Cloud Console

## Cost Considerations

Google Maps offers:
- $200 free credit per month
- Maps JavaScript API: $7 per 1000 loads (covered by free credit)
- Most small to medium projects stay within free tier

## Next Steps

1. Add geocoding feature to automatically convert addresses to coordinates
2. Add route planning between multiple hoardings
3. Add distance calculation between locations
4. Add filter options for different hoarding types on map
5. Add clustering for campaigns with many hoardings

## Support

For issues or questions:
- Check Google Maps API documentation: https://developers.google.com/maps
- React Google Maps API docs: https://react-google-maps-api-docs.netlify.app/

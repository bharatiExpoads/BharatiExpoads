# API Testing Guide for Google Maps Endpoints

## Test the Map Data Endpoint

### Using cURL (Windows PowerShell):
```powershell
# Get map data for campaign ID 1
curl -X GET "http://localhost:5000/admin/campaigns/1/map-data" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" `
  -H "Content-Type: application/json"
```

### Using cURL (Mac/Linux):
```bash
curl -X GET "http://localhost:5000/admin/campaigns/1/map-data" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Expected Response:
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

---

## Test the Share Map Link Endpoint

### Using cURL (Windows PowerShell):
```powershell
# Get shareable map link for campaign ID 1
curl -X GET "http://localhost:5000/admin/campaigns/1/share-map-link" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" `
  -H "Content-Type: application/json"
```

### Using cURL (Mac/Linux):
```bash
curl -X GET "http://localhost:5000/admin/campaigns/1/share-map-link" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Expected Response:
```json
{
  "campaignNumber": "CMP-20250101-1234",
  "totalLocations": 3,
  "shareableLink": "https://www.google.com/maps/search/?api=1&query=28.6304,77.2177",
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
      "location": "Khan Market, Delhi",
      "latitude": 28.5534,
      "longitude": 77.2383
    },
    {
      "number": 3,
      "location": "Saket, Delhi",
      "latitude": 28.5244,
      "longitude": 77.2066
    }
  ]
}
```

---

## Test Using Postman

### Setup:
1. Open Postman
2. Create new request
3. Set method to **GET**
4. Add headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
   - `Content-Type: application/json`

### Request 1: Get Map Data
- **URL**: `http://localhost:5000/admin/campaigns/1/map-data`
- **Method**: GET
- **Headers**: Authorization with JWT token

### Request 2: Get Share Link
- **URL**: `http://localhost:5000/admin/campaigns/1/share-map-link`
- **Method**: GET
- **Headers**: Authorization with JWT token

---

## Test Geocoding Script

### Test All Hoardings:
```bash
cd backend
node scripts/geocode-hoardings.js
```

### Test Specific Hoardings:
```bash
cd backend
node scripts/geocode-hoardings.js --specific hoarding-id-1 hoarding-id-2
```

### Expected Output:
```
🚀 Starting hoarding geocoding process...

📍 Found 5 hoardings without coordinates

[1/5] Processing: Connaught Place, Delhi
   ✅ Updated: 28.6304, 77.2177
   📍 Connaught Place, New Delhi, Delhi, India

[2/5] Processing: Khan Market, Delhi
   ✅ Updated: 28.5534, 77.2383
   📍 Khan Market, New Delhi, Delhi, India

...

============================================================
📊 Geocoding Summary:
   ✅ Successful: 5
   ❌ Failed: 0
   📍 Total processed: 5
============================================================
```

---

## Test Database Migration

### Check if migration is needed:
```bash
cd backend
npx prisma migrate status
```

### Create migration:
```bash
npx prisma migrate dev --name add_hoarding_coordinates
```

### Apply migration:
```bash
npx prisma migrate deploy
```

### Verify in database:
```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Hoarding' 
  AND column_name IN ('latitude', 'longitude');
```

---

## Frontend Testing Checklist

### Manual UI Testing:

#### Test 1: View Map Button
- [ ] Navigate to Campaign Details page
- [ ] Click "See on Map" button (green)
- [ ] Map modal opens
- [ ] Campaign info displayed in header
- [ ] Map loads with markers
- [ ] All locations visible

#### Test 2: Map Interactions
- [ ] Click on a marker
- [ ] InfoWindow appears with hoarding details
- [ ] Details are correct (name, size, type)
- [ ] Click another marker
- [ ] Previous InfoWindow closes
- [ ] New InfoWindow opens

#### Test 3: Location List
- [ ] Scroll to location list below map
- [ ] All locations listed with numbers
- [ ] Click on a location card
- [ ] Map zooms to that location
- [ ] Marker is highlighted

#### Test 4: Share Map
- [ ] Click "Share Map" button (orange)
- [ ] Toast notification appears
- [ ] Link copied to clipboard
- [ ] Paste link in browser
- [ ] Google Maps opens
- [ ] Location visible on map

#### Test 5: Modal Controls
- [ ] Click X button to close modal
- [ ] Modal closes smoothly
- [ ] Click "See on Map" again
- [ ] Modal reopens correctly

#### Test 6: Edge Cases
- [ ] Campaign with no coordinates
- [ ] Shows "No location data" message
- [ ] Campaign with 1 location
- [ ] Map centers correctly
- [ ] Campaign with many locations
- [ ] Map zooms appropriately

#### Test 7: Responsive Design
- [ ] Open on mobile screen size
- [ ] Modal is full-screen
- [ ] Map is scrollable
- [ ] Buttons are clickable
- [ ] Text is readable

---

## Integration Testing

### Test Full Flow:

```javascript
// 1. Create test hoarding with coordinates
const testHoarding = await prisma.hoarding.create({
  data: {
    location: "Test Location, Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    width: 40,
    height: 20,
    totalSqFt: 800,
    illumination: true,
    hoardingType: "Hoarding",
    // ... other required fields
  }
});

// 2. Create test campaign with this hoarding
const testCampaign = await prisma.campaign.create({
  data: {
    campaignNumber: "TEST-001",
    customerName: "Test Customer",
    // ... other fields
  }
});

// 3. Link hoarding to campaign
await prisma.campaignHoarding.create({
  data: {
    campaignId: testCampaign.id,
    hoardingId: testHoarding.id,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30*24*60*60*1000)
  }
});

// 4. Test map data endpoint
const mapData = await fetch(`/admin/campaigns/${testCampaign.id}/map-data`);
console.log(mapData); // Should include test hoarding

// 5. Test share link endpoint
const shareLink = await fetch(`/admin/campaigns/${testCampaign.id}/share-map-link`);
console.log(shareLink); // Should return Google Maps URL

// 6. Cleanup
await prisma.campaignHoarding.deleteMany({ where: { campaignId: testCampaign.id } });
await prisma.campaign.delete({ where: { id: testCampaign.id } });
await prisma.hoarding.delete({ where: { id: testHoarding.id } });
```

---

## Error Testing

### Test Invalid Campaign ID:
```bash
curl -X GET "http://localhost:5000/admin/campaigns/99999/map-data" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected**: 404 error with message "Campaign not found"

### Test No Authentication:
```bash
curl -X GET "http://localhost:5000/admin/campaigns/1/map-data"
```

**Expected**: 401 error "Unauthorized"

### Test Campaign with No Coordinates:
- Campaign exists but hoardings have null latitude/longitude
**Expected**: 
```json
{
  "campaignId": 1,
  "campaignNumber": "CMP-001",
  "customerName": "ABC Company",
  "locations": []
}
```

---

## Performance Testing

### Test Response Time:
```javascript
console.time('Map Data API');
await fetch('/admin/campaigns/1/map-data');
console.timeEnd('Map Data API');
// Target: < 500ms
```

### Test with Multiple Locations:
- Create campaign with 20+ hoardings
- Test map rendering performance
- Check marker clustering needs

---

## Browser Console Tests

### Open browser console and run:

```javascript
// Test map data fetch
fetch('/admin/campaigns/1/map-data', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Map Data:', data));

// Test share link fetch
fetch('/admin/campaigns/1/share-map-link', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Share Link:', data));

// Test Google Maps API loaded
console.log('Google Maps:', window.google?.maps ? 'Loaded' : 'Not loaded');
```

---

## Troubleshooting Tests

### If Map Doesn't Load:
```javascript
// Check API key
console.log('API Key:', process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

// Check Google Maps loaded
console.log('Google Maps:', typeof google !== 'undefined');

// Check for errors
window.addEventListener('error', (e) => {
  console.error('Error:', e.message);
});
```

### If Coordinates Wrong:
```javascript
// Verify coordinates in database
SELECT id, location, latitude, longitude 
FROM "Hoarding" 
WHERE latitude IS NOT NULL 
LIMIT 10;

// Check if coordinates are in valid range
// Latitude: -90 to 90
// Longitude: -180 to 180
```

---

## Success Criteria

✅ **All tests pass if:**
1. Map data endpoint returns correct campaign locations
2. Share link endpoint generates valid Google Maps URLs
3. Geocoding script converts addresses successfully
4. Map modal opens and displays markers
5. InfoWindows show correct hoarding details
6. Share functionality copies link to clipboard
7. Shared link opens in Google Maps
8. No console errors
9. Response times < 500ms
10. Works on mobile and desktop

---

## Test Data Examples

### Sample Hoarding Coordinates (Delhi):

```sql
-- Connaught Place
UPDATE "Hoarding" SET latitude = 28.6304, longitude = 77.2177 WHERE location LIKE '%Connaught%';

-- India Gate
UPDATE "Hoarding" SET latitude = 28.6129, longitude = 77.2295 WHERE location LIKE '%India Gate%';

-- Qutub Minar
UPDATE "Hoarding" SET latitude = 28.5244, longitude = 77.1855 WHERE location LIKE '%Qutub%';

-- Red Fort
UPDATE "Hoarding" SET latitude = 28.6562, longitude = 77.2410 WHERE location LIKE '%Red Fort%';

-- Lotus Temple
UPDATE "Hoarding" SET latitude = 28.5535, longitude = 77.2588 WHERE location LIKE '%Lotus%';
```

Happy Testing! 🧪✅

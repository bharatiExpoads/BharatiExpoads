# 📍 Google Maps Feature - Complete Explanation

## 🎯 How the Map Feature Works

### Overview
The map feature shows **all hoardings of a campaign** on an interactive Google Map with their exact GPS locations. It fetches addresses from your hoarding database and displays them as colored markers.

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTION                               │
│  Admin clicks "See on Map" button in Campaign Details       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND REQUEST                             │
│  fetchWithAuth('/admin/campaigns/:id/map-data')             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND API                                  │
│  campaignController.getMapData()                             │
│  • Fetches campaign from database                            │
│  • Includes all hoardings with relations                     │
│  • Filters hoardings that have latitude/longitude            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE QUERY                                  │
│  SELECT * FROM Campaign                                      │
│    JOIN CampaignHoarding                                     │
│    JOIN Hoarding                                             │
│  WHERE Campaign.id = :id                                     │
│    AND Hoarding.latitude IS NOT NULL                         │
│    AND Hoarding.longitude IS NOT NULL                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND RESPONSE                                │
│  {                                                           │
│    "campaign": { id, name, customerName, ... },              │
│    "locations": [                                            │
│      {                                                       │
│        "hoardingId": 1,                                      │
│        "location": "MG Road, Bangalore",                     │
│        "latitude": 12.9716,                                  │
│        "longitude": 77.5946,                                 │
│        "type": "LED",                                        │
│        "size": "20x10",                                      │
│        "isIlluminated": true                                 │
│      },                                                      │
│      ...more hoardings...                                    │
│    ]                                                         │
│  }                                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND DISPLAY                                │
│  CampaignMap Component                                       │
│  • Opens modal with Google Map                               │
│  • Calculates center point from all locations                │
│  • Renders colored markers for each hoarding                 │
│  • Shows InfoWindow on marker click                          │
│  • Applies filters (type, size, illumination)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Visual Representation

### 1. Campaign Details Page - Map Buttons

```
┌────────────────────────────────────────────────────────────┐
│  Campaign Details                                   [Edit] │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Customer: ABC Company                                      │
│  Campaign: Summer 2025                                      │
│  Status: Active                                             │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ 📍 See on Map    │  │ 🔗 Share Map     │              │
│  │   (Green)        │  │   (Orange)       │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                             │
│  Hoardings List:                                            │
│  • MG Road, Bangalore - LED 20x10                          │
│  • Brigade Road - Standard Hoarding 15x10                  │
│  • Indiranagar - Bus Shelter 5x5                           │
└────────────────────────────────────────────────────────────┘
```

### 2. Map Modal View

```
┌─────────────────────────────────────────────────────────────┐
│  Campaign Map - Summer 2025                          [X]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Filters:                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Search...    │ │ Type: All ▼  │ │ Size: All ▼  │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│  ┌──────────────┐ [Clear Filters]                          │
│  │ Lit: All ▼   │                                           │
│  └──────────────┘                                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              GOOGLE MAP VIEW                         │   │
│  │                                                      │   │
│  │         ┌──────────┐                                │   │
│  │         │    ①     │  ← Red marker (Standard)       │   │
│  │         └──────────┘                                │   │
│  │                        MG Road                       │   │
│  │                                                      │   │
│  │    ┌──────────┐                                     │   │
│  │    │    ②     │  ← Blue marker (LED)                │   │
│  │    └──────────┘                                     │   │
│  │         Brigade Road                                 │   │
│  │                                                      │   │
│  │                  ┌──────────┐                       │   │
│  │                  │    ③     │  ← Purple (Shelter)   │   │
│  │                  └──────────┘                       │   │
│  │                       Indiranagar                    │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  📋 Hoarding Locations (3):                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1️⃣ MG Road, Bangalore                               │    │
│  │    LED • 20x10 • Illuminated                        │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ 2️⃣ Brigade Road, Bangalore                          │    │
│  │    Standard Hoarding • 15x10 • Unlit                │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ 3️⃣ Indiranagar, Bangalore                           │    │
│  │    Bus Queue Shelter • 5x5 • Illuminated            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 3. Marker Click - InfoWindow

```
┌────────────────────────────────────────────┐
│  Clicked on Marker #1                      │
├────────────────────────────────────────────┤
│  📍 Location: MG Road, Bangalore           │
│  📏 Size: 20 x 10 feet                     │
│  🎨 Type: LED                              │
│  💡 Illumination: Yes                      │
└────────────────────────────────────────────┘
```

---

## 🎨 Marker Color Coding

| Hoarding Type          | Marker Color | Icon Number |
|------------------------|--------------|-------------|
| Standard Hoarding      | 🔴 Red       | 1, 2, 3...  |
| LED                    | 🔵 Blue      | 1, 2, 3...  |
| Promotion Vehicle      | 🟢 Green     | 1, 2, 3...  |
| Bus Queue Shelter      | 🟣 Purple    | 1, 2, 3...  |
| Bus Branding           | 🟠 Orange    | 1, 2, 3...  |
| Pole Kiosk            | 🟡 Yellow    | 1, 2, 3...  |

---

## 🔍 Filter Options Explained

### 1. Search Filter
- **What it does**: Filters by location name
- **Example**: Type "MG Road" → Only shows hoardings with "MG Road" in location
- **Live search**: Updates as you type

### 2. Type Filter
```
Dropdown Options:
• All Types
• Standard Hoarding
• LED
• Promotion Vehicle
• Bus Queue Shelter
• Bus Branding
• Pole Kiosk
```

### 3. Illumination Filter
```
Options:
• All
• Illuminated (Lit) - Shows only lit hoardings
• Unilluminated (Unlit) - Shows only unlit hoardings
```

### 4. Size Filter
```
Options:
• All Sizes
• Small (< 100 sq ft)
• Medium (100-200 sq ft)
• Large (> 200 sq ft)
```

---

## 📊 How Locations Are Fetched

### From Hoarding Master Data

When you add a hoarding in **Hoarding Master**, you enter:

```
┌─────────────────────────────────────┐
│  Add Hoarding Form                  │
├─────────────────────────────────────┤
│  Location: MG Road, Bangalore       │  ← This address
│  Width: 20 feet                     │
│  Height: 10 feet                    │
│  Type: LED                          │
│  Illuminated: ☑ Yes                 │
│  Latitude: 12.9716                  │  ← GPS coordinates
│  Longitude: 77.5946                 │  ← GPS coordinates
└─────────────────────────────────────┘
```

### Geocoding Process (Optional Script)

If you don't have latitude/longitude, run the geocoding script:

```powershell
cd backend
node scripts/geocode-hoardings.js
```

This script:
1. Reads all hoardings without GPS coordinates
2. Uses Google Geocoding API
3. Converts "MG Road, Bangalore" → (12.9716, 77.5946)
4. Updates database with coordinates

---

## 🔗 Shareable Map Link Feature

### How It Works

1. **Admin clicks "Share Map" button**
2. **Backend generates Google Maps URL**:
   ```
   https://www.google.com/maps/dir/?api=1&destination=12.9716,77.5946&waypoints=12.9700,77.5900|12.9750,77.6000
   ```
3. **Link copied to clipboard**
4. **Anyone can open** (no login required)
5. **Opens in Google Maps app or browser**

### Example Shareable Link
```
https://www.google.com/maps/dir/?api=1&
  destination=12.9716,77.5946&
  waypoints=12.9700,77.5900|12.9750,77.6000|12.9800,77.6100
```

This link will:
- Open Google Maps
- Show all hoarding locations as waypoints
- Can be used for navigation
- Works on mobile and desktop

---

## ✅ What Shows on the Map

### YES - These Hoardings Will Appear:
✅ Hoardings with `latitude` and `longitude` in database
✅ Hoardings assigned to the campaign
✅ Hoardings matching current filter criteria
✅ Hoardings within the campaign date range

### NO - These Won't Appear:
❌ Hoardings without GPS coordinates (null latitude/longitude)
❌ Hoardings not assigned to this campaign
❌ Hoardings filtered out by search/type/size filters

---

## 🛠️ Technical Implementation

### Database Structure
```sql
-- Hoarding table has these fields:
Hoarding {
  id          Int
  location    String    -- "MG Road, Bangalore"
  latitude    Float?    -- 12.9716 (optional)
  longitude   Float?    -- 77.5946 (optional)
  type        String    -- "LED", "Standard Hoarding", etc.
  width       Float
  height      Float
  isIlluminated Boolean
  ...
}
```

### API Endpoint
```javascript
GET /api/admin/campaigns/:id/map-data

Response:
{
  "campaign": {
    "id": 1,
    "campaignNumber": "CAMP-001",
    "customerName": "ABC Company"
  },
  "locations": [
    {
      "hoardingId": 1,
      "location": "MG Road, Bangalore",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "type": "LED",
      "size": "20x10",
      "isIlluminated": true
    }
  ]
}
```

---

## 🎬 Step-by-Step User Flow

### For Admin:

1. **Navigate** to Campaign Details page
2. **Click** "See on Map" (green button)
3. **Map Modal Opens** showing all campaign hoardings
4. **View** markers on interactive Google Map
5. **Click** any marker to see hoarding details
6. **Use Filters** to narrow down view:
   - Search by location name
   - Filter by type (LED, Standard, etc.)
   - Filter by size (Small, Medium, Large)
   - Filter by illumination (Lit/Unlit)
7. **Share** by clicking "Share Map" button
8. **Copy Link** from clipboard
9. **Send Link** to anyone (client, team member, etc.)

### For Anyone with Shared Link:

1. **Receive** shareable link via email/WhatsApp
2. **Click** link
3. **Opens** Google Maps (app or browser)
4. **Shows** all hoarding locations with directions
5. **Navigate** to any location using Google Maps navigation
6. **No Login Required** - Public access

---

## 📈 Real-World Example

### Campaign: "Summer Festival 2025"

**Assigned Hoardings:**
1. MG Road, Bangalore (LED, 20x10) - Lit
2. Brigade Road, Bangalore (Standard, 15x10) - Unlit
3. Indiranagar, Bangalore (Bus Shelter, 5x5) - Lit
4. Koramangala, Bangalore (LED, 20x10) - Lit
5. Whitefield, Bangalore (Standard, 15x10) - Unlit

**Map Display:**
- 🔵 Blue marker at MG Road (LED, #1)
- 🔴 Red marker at Brigade Road (Standard, #2)
- 🟣 Purple marker at Indiranagar (Shelter, #3)
- 🔵 Blue marker at Koramangala (LED, #4)
- 🔴 Red marker at Whitefield (Standard, #5)

**Filter Example:**
- Select "Type: LED" → Only shows markers #1 and #4
- Select "Illumination: Lit" → Shows markers #1, #3, #4
- Search "Brigade" → Only shows marker #2

---

## 🚀 Benefits

### For Admins:
✅ Visual overview of campaign coverage
✅ Quick location verification
✅ Easy to share with clients
✅ No manual map creation needed
✅ Real-time filtering and search

### For Clients:
✅ See campaign coverage instantly
✅ Verify hoarding locations
✅ Plan site visits
✅ Share with stakeholders
✅ No login required for viewing

### For Field Team:
✅ Navigate to hoarding locations
✅ Plan route for site visits
✅ Identify hoardings by number
✅ Access from mobile device
✅ Use Google Maps navigation

---

## 🔧 Setup Requirements

### Prerequisites:
1. ✅ Google Maps API Key (JavaScript API enabled)
2. ✅ Hoardings must have GPS coordinates (latitude/longitude)
3. ✅ Campaign must have assigned hoardings
4. ✅ Internet connection for map loading

### Configuration:
```env
# frontend/.env
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

---

## 💡 Pro Tips

1. **Add GPS Coordinates**: Always add latitude/longitude when creating hoardings
2. **Use Geocoding Script**: Run `geocode-hoardings.js` to auto-fill coordinates
3. **Test Filters**: Try different filter combinations to find specific hoardings
4. **Share Links**: Use shareable links for client presentations
5. **Mobile Friendly**: Map works perfectly on mobile devices
6. **Real-time Updates**: Map reflects any changes to hoarding locations immediately

---

## 🎯 Summary

The map feature:
- ✅ Shows **all hoardings** of a campaign on Google Maps
- ✅ Fetches locations from **hoarding master data**
- ✅ Uses **GPS coordinates** (latitude/longitude) from database
- ✅ Displays **color-coded markers** by hoarding type
- ✅ Supports **4-way filtering** (search, type, size, illumination)
- ✅ Generates **shareable public links** (no login needed)
- ✅ Works on **desktop and mobile**
- ✅ Updates **in real-time** with database changes

**That's how the map works! 🗺️✨**

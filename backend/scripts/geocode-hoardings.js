/**
 * Script to geocode hoarding addresses to latitude/longitude coordinates
 * Uses Google Geocoding API to convert addresses to coordinates
 * 
 * Usage:
 *   node scripts/geocode-hoardings.js
 * 
 * Requirements:
 *   - Set GOOGLE_MAPS_API_KEY in .env file
 *   - Enable Geocoding API in Google Cloud Console
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
require('dotenv').config();

const prisma = new PrismaClient();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Rate limiting: Google allows ~50 requests per second
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeAddress(address) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: response.data.results[0].formatted_address
      };
    } else {
      console.error(`❌ Geocoding failed for "${address}": ${response.data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error geocoding "${address}":`, error.message);
    return null;
  }
}

async function geocodeAllHoardings() {
  console.log('🚀 Starting hoarding geocoding process...\n');

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('❌ GOOGLE_MAPS_API_KEY not found in environment variables!');
    console.log('Please add GOOGLE_MAPS_API_KEY to your .env file');
    process.exit(1);
  }

  try {
    // Fetch all hoardings without coordinates
    const hoardings = await prisma.hoarding.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      },
      select: {
        id: true,
        location: true,
        latitude: true,
        longitude: true
      }
    });

    console.log(`📍 Found ${hoardings.length} hoardings without coordinates\n`);

    if (hoardings.length === 0) {
      console.log('✅ All hoardings already have coordinates!');
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < hoardings.length; i++) {
      const hoarding = hoardings[i];
      console.log(`[${i + 1}/${hoardings.length}] Processing: ${hoarding.location}`);

      const coords = await geocodeAddress(hoarding.location);

      if (coords) {
        // Update hoarding with coordinates
        await prisma.hoarding.update({
          where: { id: hoarding.id },
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude
          }
        });
        
        console.log(`   ✅ Updated: ${coords.latitude}, ${coords.longitude}`);
        console.log(`   📍 ${coords.formattedAddress}\n`);
        successCount++;
      } else {
        console.log(`   ❌ Failed to geocode\n`);
        failureCount++;
      }

      // Rate limiting: Wait 100ms between requests
      if (i < hoardings.length - 1) {
        await delay(100);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Geocoding Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📍 Total processed: ${hoardings.length}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error during geocoding process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Manual geocoding for specific hoardings
async function geocodeSpecificHoardings(hoardingIds) {
  console.log('🚀 Geocoding specific hoardings...\n');

  try {
    const hoardings = await prisma.hoarding.findMany({
      where: {
        id: { in: hoardingIds }
      }
    });

    for (const hoarding of hoardings) {
      console.log(`Processing: ${hoarding.location}`);
      const coords = await geocodeAddress(hoarding.location);

      if (coords) {
        await prisma.hoarding.update({
          where: { id: hoarding.id },
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude
          }
        });
        console.log(`✅ Updated with coordinates: ${coords.latitude}, ${coords.longitude}\n`);
      }
      await delay(100);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === '--specific') {
    // Example: node geocode-hoardings.js --specific hoarding-id-1 hoarding-id-2
    const ids = args.slice(1);
    geocodeSpecificHoardings(ids);
  } else {
    geocodeAllHoardings();
  }
}

module.exports = { geocodeAddress, geocodeAllHoardings };

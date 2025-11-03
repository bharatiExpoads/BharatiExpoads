const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Updates hoarding availability based on active campaigns
 * Sets isAvailable to false if hoarding has active campaigns, true otherwise
 */
const runAvailabilityUpdate = async () => {
  console.log('[CRON] Running hoarding availability update...');
  
  try {
    // Get all campaign hoarding records
    const campaignHoardings = await prisma.campaignHoarding.findMany({
      select: {
        hoardingId: true,
        startDate: true,
        endDate: true
      }
    });

    if (campaignHoardings.length === 0) {
      console.log('[CRON] No campaign hoardings found, setting all hoardings as available');
      
      // If no campaigns, set all hoardings as available
      await prisma.hoarding.updateMany({
        data: {
          isAvailable: true
        }
      });
      
      console.log('[CRON] All hoardings set to available');
      return;
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group by hoardingId and check if any campaign is active
    const hoardingStatus = new Map();

    campaignHoardings.forEach(campaignHoarding => {
      const { hoardingId, startDate, endDate } = campaignHoarding;
      
      // Check if today is between startDate and endDate
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : null;
      
      start.setHours(0, 0, 0, 0);
      if (end) {
        end.setHours(23, 59, 59, 999); // End of day
      }
      
      const isActive = today >= start && (!end || today <= end);
      
      // If this hoarding has any active campaign, it should be unavailable
      if (isActive) {
        hoardingStatus.set(hoardingId, false);
      } else if (!hoardingStatus.has(hoardingId)) {
        // Only set to true if we haven't found an active campaign yet
        hoardingStatus.set(hoardingId, true);
      }
    });

    // Update hoardings based on their status
    let updatedCount = 0;
    
    for (const [hoardingId, isAvailable] of hoardingStatus) {
      await prisma.hoarding.update({
        where: { id: hoardingId },
        data: { isAvailable }
      });
      updatedCount++;
    }

    // Set hoardings not in any campaign to available
    const hoardingsInCampaigns = Array.from(hoardingStatus.keys());
    const result = await prisma.hoarding.updateMany({
      where: {
        id: {
          notIn: hoardingsInCampaigns
        }
      },
      data: {
        isAvailable: true
      }
    });

    console.log(`[CRON] Updated ${updatedCount} hoardings with campaigns`);
    console.log(`[CRON] Set ${result.count} hoardings without campaigns to available`);
    console.log('[CRON] Hoarding availability update completed successfully');

  } catch (error) {
    console.error('[CRON] Error updating hoarding availability:', error);
  } finally {
    // Safely disconnect Prisma
    await prisma.$disconnect();
  }
};

// Schedule the job to run daily at midnight (00:00)
const scheduleAvailabilityUpdate = () => {
  console.log('[CRON] Scheduling hoarding availability update for daily at 00:00');
  
  cron.schedule('0 0 * * *', async () => {
    await runAvailabilityUpdate();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Adjust timezone as needed
  });
  
  console.log('[CRON] Hoarding availability update scheduled successfully');
};

// Export the function for manual execution if needed
module.exports = {
  runAvailabilityUpdate,
  scheduleAvailabilityUpdate
};

// Start the scheduler when this module is imported
scheduleAvailabilityUpdate();
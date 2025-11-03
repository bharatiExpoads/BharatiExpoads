const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

// Helper to generate unique campaign number
function generateCampaignNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${dateStr}-${random}`;
}

// Check for media/date overlap
async function isMediaAvailable(mediaId, startDate, endDate) {
  // Find any campaign with the same mediaId and overlapping dates
  const overlap = await prisma.campaign.findFirst({
    where: {
      mediaId,
      OR: [
        {
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      ],
    },
  });
  return !overlap;
}

const CampaignController = {
  // Get all campaigns for current admin
  async getAll(req, res) {
    try {
      const adminId = req.user.id;
      const campaigns = await prisma.campaign.findMany({
        where: { adminId },
        include: { vendor: true, assets: true , assignedTo: true},
        orderBy: { createdAt: 'desc' },
      });
      // console.log('Fetched campaigns for admin', adminId, campaigns);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get campaign by ID for current admin
  async getById(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const campaign = await prisma.campaign.findFirst({
        where: { id: Number(id), adminId },
        include: { vendor: true, assets: true },
      });
      if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create campaign for current admin
  async create(req, res) {
    try {
      const { customerName, phoneNumber, vendorId, status, hoardings: hoardingsRaw } = req.body;
      let hoardings = [];
      if (hoardingsRaw) {
        hoardings = hoardingsRaw; // Use array directly
      }
      // Validate required fields
      if (!customerName || !phoneNumber || !vendorId || !status || !Array.isArray(hoardings) || hoardings.length === 0) {
        return res.status(400).json({ error: 'Missing required fields or hoardings' });
      }
      // Compute campaign startDate and endDate from hoardings
      const startDate = hoardings.reduce((min, h) => !min || new Date(h.startDate) < new Date(min) ? h.startDate : min, null);
      const endDate = hoardings.reduce((max, h) => !max || new Date(h.endDate) > new Date(max) ? h.endDate : max, null);
      // Create campaign
      const campaign = await prisma.campaign.create({
        data: {
          campaignNumber: generateCampaignNumber(),
          customerName,
          phoneNumber,
          vendorId: Number(vendorId),
          status,
          adminId: req.user.id,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });
      // Create CampaignHoarding records and update hoarding availability
      for (const h of hoardings) {
        await prisma.campaignHoarding.create({
          data: {
            campaignId: campaign.id,
            hoardingId: h.id,
            startDate: new Date(h.startDate),
            endDate: h.endDate ? new Date(h.endDate) : null,
          },
        });
        // Update hoarding availability
        await prisma.hoarding.update({
          where: { id: h.id },
          data: {
            isAvailable: false,
            availability: h.endDate ? 'FURTHER_DATE' : 'IMMEDIATELY',
            bookedTill: h.endDate ? new Date(h.endDate) : null,
          },
        });
      }
      // Handle photo uploads (handled by campaignAssetsController via separate endpoint)
      res.status(201).json({ campaignId: campaign.id, campaignNumber: campaign.campaignNumber });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update campaign
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const campaign = await prisma.campaign.update({
        where: { id: Number(id) },
        data,
      });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete campaign
  async delete(req, res) {
    try {
      const { id } = req.params;
      await prisma.campaign.delete({ where: { id: Number(id) } });
      res.json({ message: 'Campaign deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Assign campaign to an employee
async assign(req, res) {
  try {
    const { campaignId, employeeId } = req.body;
    console.log('Assigning campaign', campaignId, 'to employee email:', employeeId);
    
    // Validate inputs
    if (!campaignId || !employeeId) {
      return res.status(400).json({ error: 'campaignId and employeeId are required' });
    }

    // Check if employee exists by email and get their EmployeeMaster ID
    const employeeExists = await prisma.employeeMaster.findFirst({
      where: { officialEmail: employeeId }
    });
    
    console.log('Employee found:', employeeExists);

    if (!employeeExists) {
      return res.status(400).json({ error: 'Invalid employeeId: employee does not exist' });
    }

    // Update campaign with assigned employee ID (String UUID)
    const campaign = await prisma.campaign.update({
      where: { id: Number(campaignId) },
      data: {
        assignedToId: employeeExists.id, // Use the EmployeeMaster UUID
      },
      include: { assignedTo: true, vendor: true },
    });
    
    console.log('Campaign assigned successfully:', campaign);

    res.json({ message: 'Campaign assigned successfully', campaign });
  } catch (error) {
    console.error('Campaign assignment error:', error);
    res.status(500).json({ error: error.message });
  }
},

// controllers/campaignController.js
async getAssignedCampaigns(req, res) {
  try {
    const userId = req.user.id;

    // Get the employee record
    const employee = await prisma.employeeMaster.findUnique({
      where: { userId },
      include: {
        campaigns: { // campaigns assigned to this employee
          include: { vendor: true, assets: true, hoardings: { include: { hoarding: true } } }, // include related data
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    res.json(employee.campaigns);
  } catch (error) {

    console.error('Failed to fetch assigned campaigns:', error);
    res.status(500).json({ error: error.message });
  }
},

// Extend campaign (employee only)
async extend(req, res) {
  try {
    const { campaignId, newEndDate, deduction } = req.body;
    const userId = req.user.id;

    // Verify employee is assigned to this campaign
    const employee = await prisma.employeeMaster.findUnique({
      where: { userId },
      include: { campaigns: { where: { id: Number(campaignId) } } },
    });

    if (!employee || employee.campaigns.length === 0) {
      return res.status(403).json({ error: 'Not authorized to extend this campaign' });
    }

    // Update campaign end date
    const campaign = await prisma.campaign.update({
      where: { id: Number(campaignId) },
      data: { endDate: new Date(newEndDate) },
      include: { hoardings: true },
    });

    // Update CampaignHoarding end dates proportionally
    for (const ch of campaign.hoardings) {
      if (ch.endDate) {
        await prisma.campaignHoarding.update({
          where: { id: ch.id },
          data: { endDate: new Date(newEndDate) },
        });
      }
    }

    // Log the extension (you might want to create an extension log table)
    console.log(`Campaign ${campaignId} extended to ${newEndDate} with deduction: ${deduction}`);

    res.json({ message: 'Campaign extended successfully', campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
},

// Get map data for campaign hoardings
async getMapData(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Get campaign with hoardings
    const campaign = await prisma.campaign.findFirst({
      where: { id: Number(id), adminId },
      include: {
        hoardings: {
          include: {
            hoarding: {
              select: {
                id: true,
                location: true,
                latitude: true,
                longitude: true,
                width: true,
                height: true,
                totalSqFt: true,
                hoardingType: true,
                illumination: true,
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Extract hoarding locations with coordinates
    const locations = campaign.hoardings
      .map(ch => ch.hoarding)
      .filter(h => h.latitude && h.longitude) // Only include hoardings with coordinates
      .map(h => ({
        id: h.id,
        location: h.location,
        latitude: h.latitude,
        longitude: h.longitude,
        width: h.width,
        height: h.height,
        totalSqFt: h.totalSqFt,
        type: h.hoardingType,
        illumination: h.illumination,
      }));

    res.json({
      campaignId: campaign.id,
      campaignNumber: campaign.campaignNumber,
      customerName: campaign.customerName,
      locations,
    });
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({ error: error.message });
  }
},

// Generate shareable map link
async generateShareableMapLink(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Verify campaign belongs to admin
    const campaign = await prisma.campaign.findFirst({
      where: { id: Number(id), adminId },
      include: {
        hoardings: {
          include: {
            hoarding: {
              select: {
                latitude: true,
                longitude: true,
                location: true,
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Filter hoardings with valid coordinates
    const validLocations = campaign.hoardings
      .map(ch => ch.hoarding)
      .filter(h => h.latitude && h.longitude);

    if (validLocations.length === 0) {
      return res.status(400).json({ error: 'No hoardings with location data found' });
    }

    // Create Google Maps URL with multiple markers
    const markers = validLocations
      .map((h, index) => `markers=color:red%7Clabel:${index + 1}%7C${h.latitude},${h.longitude}`)
      .join('&');

    // Calculate center point (average of all coordinates)
    const centerLat = validLocations.reduce((sum, h) => sum + h.latitude, 0) / validLocations.length;
    const centerLng = validLocations.reduce((sum, h) => sum + h.longitude, 0) / validLocations.length;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${validLocations[0].latitude},${validLocations[0].longitude}&travelmode=driving`;
    const googleMapsStaticUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=12&size=600x400&${markers}&key=YOUR_API_KEY`;
    
    // Generate a simpler shareable link showing all locations
    const shareableLink = `https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLng}`;

    res.json({
      campaignNumber: campaign.campaignNumber,
      totalLocations: validLocations.length,
      shareableLink,
      googleMapsUrl,
      locations: validLocations.map((h, index) => ({
        number: index + 1,
        location: h.location,
        latitude: h.latitude,
        longitude: h.longitude,
      })),
    });
  } catch (error) {
    console.error('Error generating shareable map link:', error);
    res.status(500).json({ error: error.message });
  }
}

};

module.exports = CampaignController; 
const BaseController = require('./baseController');

class HoardingController extends BaseController {
  constructor() {
    super('hoarding');
  }

  // Get all hoardings for current admin
  getAll = async (req, res) => {
    try {
      const adminId = req.user.id;
      const hoardings = await this.prisma.hoarding.findMany({
        where: { adminId },
        include: { landlord: true },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(hoardings);
    } catch (error) {
      console.error('Error fetching hoardings:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Get hoarding by ID for current admin
  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const hoarding = await this.prisma.hoarding.findFirst({
        where: { id, adminId },
        include: { landlord: true }
      });
      if (!hoarding) {
        return res.status(404).json({ error: 'Hoarding not found' });
      }
      res.status(200).json(hoarding);
    } catch (error) {
      console.error('Error fetching hoarding:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Create a new hoarding (with computed fields)
  create = async (req, res) => {
    try {
      const adminId = req.user.id;
      let { location, width, height, illumination, displayChargesPerMonth, oneTimePrintingCost, oneTimeMountingCost, availability, landlordId } = req.body;
      // Validate required fields
      if (!location || width == null || height == null || illumination == null || displayChargesPerMonth == null || oneTimePrintingCost == null || oneTimeMountingCost == null || !availability) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      width = parseFloat(width);
      height = parseFloat(height);
      displayChargesPerMonth = parseFloat(displayChargesPerMonth);
      oneTimePrintingCost = parseFloat(oneTimePrintingCost);
      oneTimeMountingCost = parseFloat(oneTimeMountingCost);
      if (isNaN(width) || isNaN(height) || isNaN(displayChargesPerMonth) || isNaN(oneTimePrintingCost) || isNaN(oneTimeMountingCost)) {
        return res.status(400).json({ error: 'Invalid numeric value' });
      }
      illumination = illumination === true || illumination === 'true' || illumination === 1 || illumination === '1';
      const totalSqFt = width * height;
      const totalCost = oneTimePrintingCost + oneTimeMountingCost + displayChargesPerMonth;
      const data = {
        location,
        width,
        height,
        totalSqFt,
        illumination,
        displayChargesPerMonth,
        oneTimePrintingCost,
        oneTimeMountingCost,
        totalCost,
        availability,
        adminId,
        landlordId: landlordId || null
      };
      const hoarding = await this.prisma.hoarding.create({ data });
      res.status(201).json(hoarding);
    } catch (error) {
      console.error('Error creating hoarding:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  };

  // Update an existing hoarding (with computed fields)
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const existing = await this.prisma.hoarding.findFirst({ where: { id, adminId } });
      if (!existing) {
        return res.status(404).json({ error: 'Hoarding not found' });
      }
      let { location, width, height, illumination, displayChargesPerMonth, oneTimePrintingCost, oneTimeMountingCost, availability, landlordId } = req.body;
      if (!location || width == null || height == null || illumination == null || displayChargesPerMonth == null || oneTimePrintingCost == null || oneTimeMountingCost == null || !availability) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      width = parseFloat(width);
      height = parseFloat(height);
      displayChargesPerMonth = parseFloat(displayChargesPerMonth);
      oneTimePrintingCost = parseFloat(oneTimePrintingCost);
      oneTimeMountingCost = parseFloat(oneTimeMountingCost);
      if (isNaN(width) || isNaN(height) || isNaN(displayChargesPerMonth) || isNaN(oneTimePrintingCost) || isNaN(oneTimeMountingCost)) {
        return res.status(400).json({ error: 'Invalid numeric value' });
      }
      illumination = illumination === true || illumination === 'true' || illumination === 1 || illumination === '1';
      const totalSqFt = width * height;
      const totalCost = oneTimePrintingCost + oneTimeMountingCost + displayChargesPerMonth;
      const data = {
        location,
        width,
        height,
        totalSqFt,
        illumination,
        displayChargesPerMonth,
        oneTimePrintingCost,
        oneTimeMountingCost,
        totalCost,
        availability,
        landlordId: landlordId || null
      };
      const updated = await this.prisma.hoarding.update({ where: { id }, data });
      res.status(200).json(updated);
    } catch (error) {
      console.error('Error updating hoarding:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  };

  // Get all landlords for dropdown
  getLandlords = async (req, res) => {
    try {
      const adminId = req.user.id;
      const landlords = await this.prisma.landlord.findMany({
        where: { adminId },
        select: {
          id: true,
          landlordName: true,
          address: true
        },
        orderBy: { landlordName: 'asc' }
      });
      res.status(200).json(landlords);
    } catch (error) {
      console.error('Error fetching landlords:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
}

module.exports = new HoardingController();

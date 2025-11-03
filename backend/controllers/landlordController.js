const BaseController = require('./baseController');

class LandlordController extends BaseController {
  constructor() {
    super('landlord');
  }
  
  // Override getAll to include siteLocation (Hoarding) information
  getAll = async (req, res) => {
    try {
      const adminId = req.user.id;
      const landlords = await this.prisma.landlord.findMany({
        where: { adminId },
        include: {
          siteLocation: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.status(200).json(landlords);
    } catch (error) {
      console.error('Error fetching landlords:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  // Override getById to include siteLocation (Hoarding) information
  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      
      const landlord = await this.prisma.landlord.findFirst({
        where: { 
          id,
          adminId 
        },
        include: {
          siteLocation: true
        }
      });
      
      if (!landlord) {
        return res.status(404).json({ error: 'Landlord not found' });
      }
      
      res.status(200).json(landlord);
    } catch (error) {
      console.error('Error fetching landlord:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
}

module.exports = new LandlordController();
const BaseController = require('./baseController');

class VendorController extends BaseController {
  constructor() {
    super('vendor');
  }

  // Override getAll: filter by adminId
  getAll = async (req, res) => {
    try {
      const adminId = req.user.id;
      const records = await this.prisma.vendor.findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(records);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Override getById: filter by adminId
  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const record = await this.prisma.vendor.findFirst({
        where: { id: Number(id), adminId }
      });
      if (!record) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      res.status(200).json(record);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Override update: no adminId filter
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      Object.keys(data).forEach(key => {
        if (data[key] === '') data[key] = null;
      });
      const updatedRecord = await this.prisma.vendor.update({
        where: { id: Number(id) },
        data
      });
      res.status(200).json(updatedRecord);
    } catch (error) {
      console.error('Error updating vendor:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  };

  // Override delete: no adminId filter
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      await this.prisma.vendor.delete({
        where: { id: Number(id) }
      });
      res.status(200).json({ message: 'Vendor deleted successfully' });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Custom create with validation and user-friendly errors
  create = async (req, res) => {
    try {
      const requiredFields = [
        'name', 'companyName', 'type', 'address', 'city', 'state', 'contactPerson',
        'mobile', 'email', 'gstNumber', 'panNumber', 'bankName', 'branch', 'accountNumber', 'ifscCode', 'aadharNumber'
      ];
      const data = { ...req.body, adminId: req.user.id };
      // Check required fields
      for (const field of requiredFields) {
        if (!data[field] || data[field].toString().trim() === '') {
          return res.status(400).json({ error: `${field} is required` });
        }
      }
      // Additional format checks (basic)
      if (!/^\d{10}$/.test(data.mobile)) return res.status(400).json({ error: 'Mobile must be 10 digits' });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return res.status(400).json({ error: 'Invalid email format' });
      if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(data.gstNumber)) return res.status(400).json({ error: 'Invalid GST number format' });
      if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(data.panNumber)) return res.status(400).json({ error: 'Invalid PAN number format' });
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) return res.status(400).json({ error: 'Invalid IFSC code format' });
      if (!/^\d{12}$/.test(data.aadharNumber)) return res.status(400).json({ error: 'Aadhar must be 12 digits' });
      // Sanitize: convert empty strings to null
      Object.keys(data).forEach(key => {
        if (data[key] === '') data[key] = null;
      });
      const vendor = await this.prisma.vendor.create({ data });
      res.status(201).json(vendor);
    } catch (error) {
      // Prisma unique constraint violation
      if (error.code === 'P2002') {
        return res.status(400).json({ error: `Duplicate value for field: ${error.meta.target}` });
      }
      console.error('Error creating vendor:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  };
}

module.exports = new VendorController(); 
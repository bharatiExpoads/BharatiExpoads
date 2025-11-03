const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class VoucherBaseController {
  constructor(modelName) {
    this.modelName = modelName;
    this.prismaModel = prisma[modelName];
  }

  // Get all vouchers for current admin
  getAll = async (req, res) => {
    try {
      const adminId = req.user.id;
      const vouchers = await this.prismaModel.findMany({
        where: { adminId },
        orderBy: { date: 'desc' }
      });
      res.status(200).json(vouchers);
    } catch (err) {
      console.error(`Error fetching ${this.modelName}:`, err);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Get single voucher by ID
  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const voucher = await this.prismaModel.findFirst({
        where: { id, adminId }
      });
      if (!voucher) {
        return res.status(404).json({ error: 'Voucher not found' });
      }
      res.status(200).json(voucher);
    } catch (err) {
      console.error(`Error fetching ${this.modelName} by ID:`, err);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Create new voucher
  create = async (req, res) => {
    try {
      const adminId = req.user.id;
      const data = { ...req.body, adminId };

      // Convert date to ISO string if provided
      if (data.date) {
        data.date = new Date(data.date).toISOString();
      }

      const created = await this.prismaModel.create({ data });
      res.status(201).json(created);
    } catch (err) {
      console.error(`Error creating ${this.modelName}:`, err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  };

  // Update existing voucher
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const existing = await this.prismaModel.findFirst({ where: { id, adminId } });
      if (!existing) return res.status(404).json({ error: 'Voucher not found' });

      const data = { ...req.body };
      if (data.date) {
        data.date = new Date(data.date).toISOString();
      }

      const updated = await this.prismaModel.update({
        where: { id },
        data
      });

      res.status(200).json(updated);
    } catch (err) {
      console.error(`Error updating ${this.modelName}:`, err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  };

  // Delete voucher
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const existing = await this.prismaModel.findFirst({ where: { id, adminId } });
      if (!existing) return res.status(404).json({ error: 'Voucher not found' });

      await this.prismaModel.delete({ where: { id } });
      res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
      console.error(`Error deleting ${this.modelName}:`, err);
      res.status(500).json({ error: 'Server error' });
    }
  };
}

module.exports = VoucherBaseController;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to generate unique bill number
function generateBillNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BILL-${dateStr}-${random}`;
}

const BillController = {
  // Get all bills for current admin
  async getAll(req, res) {
    try {
      const adminId = req.user.id;
      const bills = await prisma.bill.findMany({
        where: { adminId },
        include: { campaign: { include: { vendor: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json(bills);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get bill by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const bill = await prisma.bill.findFirst({
        where: { id: Number(id), adminId },
        include: { campaign: { include: { vendor: true, hoardings: { include: { hoarding: true } } } } },
      });
      if (!bill) return res.status(404).json({ error: 'Bill not found' });
      res.json(bill);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Generate bill for a campaign
  async generate(req, res) {
    try {
      const { campaignId } = req.body;
      const adminId = req.user.id;

      console.log('Generating bill for campaign:', campaignId, 'Admin:', adminId);

      // Get campaign with all details
      const campaign = await prisma.campaign.findFirst({
        where: { id: Number(campaignId), adminId },
        include: {
          vendor: true,
          hoardings: { include: { hoarding: true } },
          admin: { include: { adminProfile: true } }
        },
      });

      if (!campaign) {
        console.log('Campaign not found');
        return res.status(404).json({ error: 'Campaign not found' });
      }

      console.log('Campaign found:', campaign.campaignNumber);
      console.log('Hoardings count:', campaign.hoardings?.length);

      if (!campaign.hoardings || campaign.hoardings.length === 0) {
        return res.status(400).json({ error: 'Campaign has no hoardings assigned. Please add hoardings first.' });
      }

      // Get admin profile for company details
      const adminProfile = campaign.admin.adminProfile?.[0];

      // Calculate totals from hoardings
      let subtotal = 0;
      const hoardingDetails = campaign.hoardings.map(ch => {
        const hoarding = ch.hoarding;
        const days = Math.ceil((new Date(ch.endDate || ch.startDate) - new Date(ch.startDate)) / (1000 * 60 * 60 * 24));
        const cost = hoarding.displayChargesPerMonth * (days / 30); // Approximate monthly cost
        subtotal += cost;
        return {
          location: hoarding.location,
          size: `${hoarding.width}x${hoarding.height}`,
          mediaType: hoarding.mediaType || 'N/A',
          startDate: ch.startDate,
          endDate: ch.endDate,
          cost: cost,
        };
      });

      const taxAmount = subtotal * 0.18; // 18% GST
      const totalAmount = subtotal + taxAmount;

      console.log('Bill calculations - Subtotal:', subtotal, 'Tax:', taxAmount, 'Total:', totalAmount);

      // Create bill
      const bill = await prisma.bill.create({
        data: {
          billNumber: generateBillNumber(),
          campaignId: campaign.id,
          adminId,
          companyName: adminProfile?.companyName || 'Company Name',
          gstNo: adminProfile?.gstNo,
          terms: adminProfile?.terms,
          instructions: adminProfile?.instructions,
          customerName: campaign.customerName,
          customerPhone: campaign.phoneNumber,
          vendorName: campaign.vendor.name,
          campaignNumber: campaign.campaignNumber,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          hoardings: hoardingDetails,
          subtotal,
          taxAmount,
          totalAmount,
        },
      });

      console.log('Bill created successfully:', bill.billNumber);
      res.status(201).json(bill);
    } catch (error) {
      console.error('Bill generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Approve bill
  async approve(req, res) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const adminId = req.user.id;

      const bill = await prisma.bill.findFirst({
        where: { id: Number(id), adminId },
      });

      if (!bill) return res.status(404).json({ error: 'Bill not found' });

      const updateData = {
        status: rejectionReason ? 'REJECTED' : 'APPROVED',
        approvedAt: new Date(),
        approvedBy: req.user.id,
      };

      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      const updatedBill = await prisma.bill.update({
        where: { id: Number(id) },
        data: updateData,
      });

      res.json(updatedBill);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update bill
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const bill = await prisma.bill.update({
        where: { id: Number(id) },
        data,
      });
      res.json(bill);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete bill
  async delete(req, res) {
    try {
      const { id } = req.params;
      await prisma.bill.delete({ where: { id: Number(id) } });
      res.json({ message: 'Bill deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = BillController;

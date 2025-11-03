class VoucherController {
  constructor(prisma) {
    this.prisma = prisma;
  }

  createPaymentVoucher = async (req, res) => {
    try {
      const { date, partyName, paymentMode, narration } = req.body;
      const adminId = req.user.id;
      if (!date || !partyName || !paymentMode) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const voucher = await this.prisma.paymentVoucher.create({
        data: {
          date: new Date(date),
          partyName,
          paymentMode,
          narration,
          adminId
        }
      });
      res.status(201).json(voucher);
    } catch (err) {
      console.error('Error creating PaymentVoucher:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };

  getPaymentVouchers = async (req, res) => {
    try {
      const adminId = req.user.id;
      const vouchers = await this.prisma.paymentVoucher.findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(vouchers);
    } catch (err) {
      console.error('Error fetching PaymentVouchers:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };

  // Repeat similar methods for other voucher types
}

module.exports = new VoucherController(require('../prisma/client'));

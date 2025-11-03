const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('📦 Enquiry controller loaded');
// Create Enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const data = { ...req.body, adminId: req.user.id };
    const enquiry = await prisma.enquiry.create({ data });
    res.status(201).json(enquiry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Enquiry
exports.updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const enquiry = await prisma.enquiry.update({
      where: { id: Number(id) },
      data,
    });
    res.json(enquiry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Enquiry
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.enquiry.delete({ where: { id: Number(id) } });
    res.json({ message: 'Enquiry deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Enquiries for current admin
exports.getAllEnquiries = async (req, res) => {
  try {
    const adminId = req.user.id;
    const enquiries = await prisma.enquiry.findMany({ where: { adminId }, orderBy: { createdAt: 'desc' } });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get One Enquiry for current admin
exports.getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const enquiry = await prisma.enquiry.findFirst({ where: { id: Number(id), adminId } });
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByEnquiryNumber = async (req, res) => {
  console.log('getByEnquiryNumber', req.query);
  try {
    
    const { enquiryNumber } = req.query;
    const adminId = req.user.id;
    if (!enquiryNumber) return res.status(400).json({ error: 'enquiryNumber is required' });
    let enquiry = await prisma.enquiry.findFirst({ where: { id: Number(enquiryNumber), adminId } });
    if (!enquiry) {
      // Fallback: try without adminId for demo/testing
      enquiry = await prisma.enquiry.findFirst({ where: { id: Number(enquiryNumber) } });
      if (!enquiry) {
        console.error('Enquiry not found for enquiryNumber:', enquiryNumber, 'adminId:', adminId);
        return res.status(404).json({ error: 'Enquiry not found' });
      }
    }
    res.json(enquiry);
  } catch (error) {
    console.error('Error in getByEnquiryNumber:', error);
    res.status(500).json({ error: error.message });
  }
}; 
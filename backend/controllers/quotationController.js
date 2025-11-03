const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { exportQuotationToPDF, exportQuotationToExcel } = require('../utils/quotationExport'); // stubs, to implement

// Create Quotation
exports.createQuotation = async (req, res) => {
  try {
    console.log('createQuotation payload:', req.body);
    const { enquiryId, hoardingIds } = req.body;
    const adminId = req.user.id;
    if (!enquiryId || !Array.isArray(hoardingIds) || hoardingIds.length === 0) {
      console.log('400 error: Missing enquiryId or hoardingIds');
      return res.status(400).json({ error: 'enquiryId and non-empty hoardingIds array are required' });
    }
    // Check that enquiry exists and belongs to this admin
    const enquiry = await prisma.enquiry.findFirst({ where: { id: Number(enquiryId), adminId } });
    if (!enquiry) {
      console.log('400 error: Invalid enquiryId', enquiryId, 'adminId', adminId);
      return res.status(400).json({ error: 'Invalid enquiryId' });
    }
    // Fetch hoarding details
    const hoardings = await prisma.hoarding.findMany({ where: { id: { in: hoardingIds }, adminId } });
    if (!hoardings || hoardings.length !== hoardingIds.length) {
      console.log('400 error: Some hoardings not found or do not belong to this admin', hoardingIds);
      return res.status(400).json({ error: 'Some hoardings not found or do not belong to this admin' });
    }
    // Calculate total
    const total = hoardings.reduce((acc, h) => acc + (h.totalCost || 0), 0);
    // Store hoardingIds and hoarding details in items
    const quotation = await prisma.quotation.create({
      data: {
        enquiryId: Number(enquiryId),
        hoardingIds: hoardingIds,
        items: hoardings,
        total,
        adminId
      }
    });
    // Prepare summary
    const summary = {
      quotationNumber: quotation.id,
      clientName: enquiry.name,
      clientContact: enquiry.contactNumber,
      mediaNames: hoardings.map(h => h.location)
    };
    res.status(201).json(summary);
  } catch (error) {
    console.error('Error in createQuotation:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get Quotation by ID for current admin
exports.getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const quotation = await prisma.quotation.findFirst({
      where: { id: Number(id), adminId },
      include: { enquiry: true }
    });
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    res.json({
      ...quotation,
      clientName: quotation.enquiry?.name || '',
      clientContact: quotation.enquiry?.contactNumber || '',
      items: quotation.items || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Quotations for current admin
exports.getAllQuotations = async (req, res) => {
  try {
    const adminId = req.user.id;
    const quotations = await prisma.quotation.findMany({ where: { adminId }, orderBy: { createdAt: 'desc' } });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search Enquiry by inquiryNumber or phone for current admin
exports.searchEnquiry = async (req, res) => {
  try {
    const { inquiryNumber, enquiryNumber, phone } = req.query;
    const adminId = req.user.id;
    let enquiry;
    const idToSearch = inquiryNumber || enquiryNumber;
    if (idToSearch) {
      enquiry = await prisma.enquiry.findFirst({ where: { id: Number(idToSearch), adminId } });
    } else if (phone) {
      enquiry = await prisma.enquiry.findFirst({ where: { contactNumber: phone, adminId } });
    }
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Hoardings with filters for current admin
exports.getHoardings = async (req, res) => {
  try {
    const { city, location, mediaType, WT, HT, sqFt, illumination, availability, charges, printingCost, mountingCost } = req.query;
    const adminId = req.user.id;
    const filters = { adminId };
    if (city) filters.location = { contains: city, mode: 'insensitive' };
    if (location) filters.location = { contains: location, mode: 'insensitive' };
    if (mediaType) filters.mediaType = { equals: mediaType };
    if (illumination) filters.illumination = illumination === 'true';
    if (availability) filters.availability = availability;
    if (WT) filters.width = { equals: parseFloat(WT) };
    if (HT) filters.height = { equals: parseFloat(HT) };
    if (sqFt) filters.totalSqFt = { equals: parseFloat(sqFt) };
    if (charges) filters.displayChargesPerMonth = { equals: parseFloat(charges) };
    if (printingCost) filters.oneTimePrintingCost = { equals: parseFloat(printingCost) };
    if (mountingCost) filters.oneTimeMountingCost = { equals: parseFloat(mountingCost) };
    const hoardings = await prisma.hoarding.findMany({ where: filters });
    res.json(hoardings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export Quotation to PDF (admin scoped)
exports.exportQuotationPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    if (!id) return res.status(400).json({ error: 'Quotation ID required' });
    const quotation = await prisma.quotation.findFirst({ where: { id: Number(id), adminId } });
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    const pdfBuffer = await exportQuotationToPDF(id);
    if (!pdfBuffer) return res.status(404).json({ error: 'Failed to generate PDF' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=quotation_${id}.pdf`);
    res.end(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export Quotation to Excel (admin scoped)
exports.exportQuotationExcel = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    if (!id) return res.status(400).json({ error: 'Quotation ID required' });
    const quotation = await prisma.quotation.findFirst({ where: { id: Number(id), adminId } });
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    const excelBuffer = await exportQuotationToExcel(id);
    if (!excelBuffer) return res.status(404).json({ error: 'Failed to generate Excel' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=quotation_${id}.xlsx`);
    res.end(excelBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Quotation by ID for current admin
exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { hoardingIds, items, total } = req.body;
    // Find the quotation
    const quotation = await prisma.quotation.findFirst({ where: { id: Number(id), adminId } });
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    // Update fields
    const updated = await prisma.quotation.update({
      where: { id: Number(id) },
      data: {
        hoardingIds: hoardingIds || quotation.hoardingIds,
        items: items || quotation.items,
        total: total !== undefined ? total : quotation.total,
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 
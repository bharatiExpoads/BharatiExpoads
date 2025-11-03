const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const prisma = new PrismaClient();

exports.exportQuotationToPDF = async (quotationId) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: Number(quotationId) },
    include: { enquiry: true }
  });
  if (!quotation) throw new Error('Quotation not found');
  const doc = new PDFDocument({ margin: 40 });
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  // Header
  doc.fontSize(20).text('Media Proposal / Quotation', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Inquiry #: ${quotation.enquiry?.id || ''}`);
  doc.text(`Name: ${quotation.enquiry?.name || ''}`);
  doc.text(`Contact: ${quotation.enquiry?.contactNumber || ''}`);
  doc.text(`Type: ${quotation.enquiry?.type || ''}`);
  doc.text(`Media Requirement: ${quotation.enquiry?.mediaRequirement || ''}`);
  doc.text(`Date: ${quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : ''}`);
  doc.moveDown();

  // Table header
  doc.font('Helvetica-Bold').text('Location', 40, doc.y, { continued: true, width: 100 });
  doc.text('Media Type', 140, doc.y, { continued: true, width: 80 });
  doc.text('Size', 220, doc.y, { continued: true, width: 60 });
  doc.text('Illum.', 280, doc.y, { continued: true, width: 40 });
  doc.text('Avail.', 320, doc.y, { continued: true, width: 50 });
  doc.text('Charges', 370, doc.y, { continued: true, width: 60 });
  doc.text('Total', 430, doc.y, { width: 60 });
  doc.font('Helvetica');

  // Table rows
  let items = Array.isArray(quotation.items) ? quotation.items : (quotation.items ? quotation.items : []);
  if (!Array.isArray(items)) items = [];
  items.forEach(item => {
    doc.text(item.location || '', 40, doc.y, { continued: true, width: 100 });
    doc.text(item.mediaType || '', 140, doc.y, { continued: true, width: 80 });
    doc.text(`${item.width || ''}x${item.height || ''}`, 220, doc.y, { continued: true, width: 60 });
    doc.text(item.illumination ? 'Yes' : 'No', 280, doc.y, { continued: true, width: 40 });
    doc.text(item.availability || '', 320, doc.y, { continued: true, width: 50 });
    doc.text(item.displayChargesPerMonth != null ? item.displayChargesPerMonth : '', 370, doc.y, { continued: true, width: 60 });
    doc.text(item.totalCost != null ? item.totalCost : '', 430, doc.y, { width: 60 });
  });
  doc.moveDown();
  doc.font('Helvetica-Bold').text(`Grand Total: ₹${quotation.total != null ? quotation.total.toLocaleString() : '0'}`, { align: 'right' });
  doc.moveDown();
  doc.fontSize(10).font('Helvetica').text('Thank you for your business!', { align: 'center' });
  doc.end();
  return await new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
};

exports.exportQuotationToExcel = async (quotationId) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: Number(quotationId) },
    include: { enquiry: true }
  });
  if (!quotation) throw new Error('Quotation not found');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Quotation');

  // Header
  sheet.mergeCells('A1', 'G1');
  sheet.getCell('A1').value = 'Media Proposal / Quotation';
  sheet.getCell('A1').font = { size: 16, bold: true };
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  sheet.addRow([]);
  sheet.addRow([`Inquiry #: ${quotation.enquiry?.id || ''}`]);
  sheet.addRow([`Name: ${quotation.enquiry?.name || ''}`]);
  sheet.addRow([`Contact: ${quotation.enquiry?.contactNumber || ''}`]);
  sheet.addRow([`Type: ${quotation.enquiry?.type || ''}`]);
  sheet.addRow([`Media Requirement: ${quotation.enquiry?.mediaRequirement || ''}`]);
  sheet.addRow([`Date: ${quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : ''}`]);
  sheet.addRow([]);

  // Table header
  const headerRow = sheet.addRow(['Location', 'Media Type', 'Size', 'Illum.', 'Avail.', 'Charges', 'Total']);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };

  // Table rows
  let items = Array.isArray(quotation.items) ? quotation.items : (quotation.items ? quotation.items : []);
  if (!Array.isArray(items)) items = [];
  items.forEach(item => {
    sheet.addRow([
      item.location || '',
      item.mediaType || '',
      `${item.width || ''}x${item.height || ''}`,
      item.illumination ? 'Yes' : 'No',
      item.availability || '',
      item.displayChargesPerMonth != null ? item.displayChargesPerMonth : '',
      item.totalCost != null ? item.totalCost : ''
    ]);
  });

  // Grand total
  sheet.addRow([]);
  const totalRow = sheet.addRow(['', '', '', '', '', 'Grand Total', quotation.total != null ? quotation.total : 0]);
  totalRow.font = { bold: true };
  totalRow.getCell(7).numFmt = '₹#,##0.00';

  // Footer
  sheet.addRow([]);
  sheet.addRow(['Thank you for your business!']);

  // Style
  sheet.columns.forEach(col => {
    col.width = 16;
    col.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  return await workbook.xlsx.writeBuffer();
}; 
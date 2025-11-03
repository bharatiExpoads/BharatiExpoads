const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const enquiryController = require('../controllers/enquiryController');
const quotationController = require('../controllers/quotationController');
const vendorController = require('../controllers/vendorController');
const campaignController = require('../controllers/campaignController');
const campaignAssetsController = require('../controllers/campaignAssetsController');
const employeePermissionController = require('../controllers/employeePermissionController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/campaign-assets/' });
const { auth, isAdmin } = require('../middlewares/auth');


// All routes in this file require authentication and admin role
router.use(auth);
// router.use(isAdmin);

// Employee management routes
router.get('/employees', adminController.getEmployees);
router.post('/employees/create', adminController.createEmployee);
router.put('/employees/:employeeId/approve', adminController.approveEmployee);
router.put('/employees/:employeeId/reject', adminController.rejectEmployee);
router.put('/employees/:employeeId/deactivate', adminController.deactivateEmployee);
router.delete('/employees/:employeeId', adminController.deleteEmployee);
// Employee Permissions
router.get('/employees/:employeeId/permissions', employeePermissionController.getByEmployee);
router.post('/employees/:id/permissions', employeePermissionController.create);
router.put('/permissions/:id', employeePermissionController.update);
router.delete('/permissions/:id', employeePermissionController.delete);

// Enquiry CRUD
router.post('/enquiry', auth, enquiryController.createEnquiry);
router.put('/enquiry/:id', auth, enquiryController.updateEnquiry);
router.delete('/enquiry/:id', auth, enquiryController.deleteEnquiry);
router.get('/enquiry', auth, enquiryController.getAllEnquiries);
router.get('/enquiry/by-enquiry-number', auth, enquiryController.getByEnquiryNumber);
router.get('/enquiry/:id', auth, enquiryController.getEnquiryById);

// Quotation CRUD & Search
router.post('/quotation', auth, quotationController.createQuotation);
router.post('/quotation/create', auth, quotationController.createQuotation);
router.put('/quotation/:id', auth, quotationController.updateQuotation);
router.get('/quotation/:id', auth, quotationController.getQuotationById);
router.get('/quotation', auth, quotationController.getAllQuotations);
router.get('/quotation/search', auth, quotationController.searchEnquiry);
router.get('/quotation/:id/pdf', auth, quotationController.exportQuotationPDF);
router.get('/quotation/:id/excel', auth, quotationController.exportQuotationExcel);

// Hoardings with filters
router.get('/hoardings', auth, quotationController.getHoardings);

// Vendor CRUD (Admin only)
router.get('/vendors', vendorController.getAll);
router.get('/vendors/:id', vendorController.getById);
router.post('/vendors', vendorController.create);
router.put('/vendors/:id', vendorController.update);
router.delete('/vendors/:id', vendorController.delete);

// Campaign CRUD (Admin only)
router.get('/campaigns', campaignController.getAll);
router.get('/campaigns/:id', campaignController.getById);
router.post('/campaigns', campaignController.create);
router.put('/campaigns/:id', campaignController.update);
router.delete('/campaigns/:id', campaignController.delete);

// Campaign Map Routes
router.get('/campaigns/:id/map-data', campaignController.getMapData);
router.get('/campaigns/:id/share-map-link', campaignController.generateShareableMapLink);

// Campaign Assets (Admin only)
router.post('/campaign-assets/upload', upload.array('files', 10), campaignAssetsController.upload);
router.get('/campaign-assets', campaignAssetsController.getByCampaign);
router.delete('/campaign-assets/:id', campaignAssetsController.delete);

// Assign campaign to an employee
router.get('/assigned', campaignController.getAssignedCampaigns);
router.post('/campaigns/assign', campaignController.assign);

// Extend campaign (employee)
router.post('/campaigns/extend', campaignController.extend);

// Bill management
const billController = require('../controllers/billController');
router.get('/bills', billController.getAll);
router.get('/bills/:id', billController.getById);
router.post('/bills/generate', billController.generate);
router.put('/bills/:id/approve', billController.approve);
router.put('/bills/:id', billController.update);
router.delete('/bills/:id', billController.delete);

// Task management
const taskController = require('../controllers/taskController');
router.get('/tasks', taskController.getAll);
router.get('/tasks/stats', taskController.getStats);
router.get('/tasks/:id', taskController.getById);
router.post('/tasks', taskController.create);
router.put('/tasks/:id', taskController.update);
router.delete('/tasks/:id', taskController.delete);
router.post('/tasks/:id/updates', taskController.addUpdate);

module.exports = router;

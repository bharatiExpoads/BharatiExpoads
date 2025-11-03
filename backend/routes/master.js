const express = require('express');
const router = express.Router();

const {
  auth,
  isAdmin
} = require('../middlewares/auth');

// Controllers
const hoardingController = require('../controllers/hoardingController');
const labourController = require('../controllers/labourController');
const employeeMasterController = require('../controllers/employeeMasterController');
const landlordController = require('../controllers/landlordController');
const clientController = require('../controllers/clientController');
const agencyController = require('../controllers/agencyController');
const creditorController = require('../controllers/creditorController');
const printerController = require('../controllers/printerController');
const designerController = require('../controllers/designerController');
const employeePermissionController = require('../controllers/employeePermissionController');


// for the voucher routes

const paymentVoucher = require('../controllers/paymentVoucherController');
const receiptVoucher = require('../controllers/receiptVoucherController');
const journalVoucher = require('../controllers/journalVoucherController');
const contraVoucher = require('../controllers/contraVoucherController');
const debitNote = require('../controllers/debitNoteController');
const creditNote = require('../controllers/creditNoteController');

// 🔐 Auth middlewares
router.use(auth);
// router.use(isAdmin); // Only Admins (and Super Admins) can access this

// 🌐 Hoarding Routes
router.get('/hoardings', hoardingController.getAll);
router.get('/hoardings/:id', hoardingController.getById);
router.post('/hoardings', hoardingController.create);
router.put('/hoardings/:id', hoardingController.update);
router.delete('/hoardings/:id', hoardingController.delete);
router.get('/landlords-dropdown', hoardingController.getLandlords);

// 🛠 Labour Routes
router.get('/labours', labourController.getAll);
router.get('/labours/:id', labourController.getById);
router.post('/labours', labourController.create);
router.put('/labours/:id', labourController.update);
router.delete('/labours/:id', labourController.delete);

// 👥 EmployeeMaster Routes
router.get('/employees', employeeMasterController.getAll);
router.get('/employees/:id', employeeMasterController.getById);
router.post('/employees', employeeMasterController.create);
router.put('/employees/:id', employeeMasterController.update);
router.delete('/employees/:id', employeeMasterController.delete);

// 🧑‍🌾 Landlord Routes
router.get('/landlords', landlordController.getAll);
router.get('/landlords/:id', landlordController.getById);
router.post('/landlords', landlordController.create);
router.put('/landlords/:id', landlordController.update);
router.delete('/landlords/:id', landlordController.delete);

// 👨‍💼 Client Routes
router.get('/clients', clientController.getAll);
router.get('/clients/:id', clientController.getById);
router.post('/clients', clientController.create);
router.put('/clients/:id', clientController.update);
router.delete('/clients/:id', clientController.delete);

// 🏢 Agency Routes
router.get('/agencies', agencyController.getAll);
router.get('/agencies/:id', agencyController.getById);
router.post('/agencies', agencyController.create);
router.put('/agencies/:id', agencyController.update);
router.delete('/agencies/:id', agencyController.delete);

// 💰 Creditor Routes
router.get('/creditors', creditorController.getAll);
router.get('/creditors/:id', creditorController.getById);
router.post('/creditors', creditorController.create);
router.put('/creditors/:id', creditorController.update);
router.delete('/creditors/:id', creditorController.delete);

// 🖨️ Printer Routes
router.get('/printers', printerController.getAll);
router.get('/printers/:id', printerController.getById);
router.post('/printers', printerController.create);
router.put('/printers/:id', printerController.update);
router.delete('/printers/:id', printerController.delete);

// 🎨 Designer Routes
router.get('/designers', designerController.getAll);
router.get('/designers/:id', designerController.getById);
router.post('/designers', designerController.create);
router.put('/designers/:id', designerController.update);
router.delete('/designers/:id', designerController.delete);

// Voucher Routes
// Payment Voucher
router.get('/vouchers/payment',  paymentVoucher.getAll);
router.get('/vouchers/payment/:id',  paymentVoucher.getById);
router.post('/vouchers/payment',  paymentVoucher.create);
router.put('/vouchers/payment/:id',  paymentVoucher.update);
router.delete('/vouchers/payment/:id',  paymentVoucher.delete);

// Receipt Voucher
router.get('/vouchers/receipt',  receiptVoucher.getAll);
router.get('/vouchers/receipt/:id',  receiptVoucher.getById);
router.post('/vouchers/receipt',  receiptVoucher.create);
router.put('/vouchers/receipt/:id',  receiptVoucher.update);
router.delete('/vouchers/receipt/:id',  receiptVoucher.delete);

// Journal Voucher
router.get('/vouchers/journal',  journalVoucher.getAll);
router.get('/vouchers/journal/:id',  journalVoucher.getById);
router.post('/vouchers/journal',  journalVoucher.create);
router.put('/vouchers/journal/:id',  journalVoucher.update);
router.delete('/vouchers/journal/:id',  journalVoucher.delete);

// Contra Voucher
router.get('/vouchers/contra',  contraVoucher.getAll);
router.get('/vouchers/contra/:id',  contraVoucher.getById);
router.post('/vouchers/contra',  contraVoucher.create);
router.put('/vouchers/contra/:id',  contraVoucher.update);
router.delete('/vouchers/contra/:id',  contraVoucher.delete);

// Debit Note
router.get('/vouchers/debit-note',  debitNote.getAll);
router.get('/vouchers/debit-note/:id',  debitNote.getById);
router.post('/vouchers/debit-note',  debitNote.create);
router.put('/vouchers/debit-note/:id',  debitNote.update);
router.delete('/vouchers/debit-note/:id',  debitNote.delete);

// Credit Note
router.get('/vouchers/credit-note',  creditNote.getAll);
router.get('/vouchers/credit-note/:id',  creditNote.getById);
router.post('/vouchers/credit-note',  creditNote.create);
router.put('/vouchers/credit-note/:id',  creditNote.update);
router.delete('/vouchers/credit-note/:id',  creditNote.delete);



// Employee Permissions
router.get('/employees/dashboard/permissions', employeePermissionController.getForDashboard);
router.get('/employees/:employeeId/permissions', employeePermissionController.getByEmployee);
router.post('/employees/:id/permissions', employeePermissionController.create);
router.put('/permissions/:id', employeePermissionController.update);
router.delete('/permissions/:id', employeePermissionController.delete);
// New route for employee dashboard (fetch own permissions)

// for the financing things

module.exports = router;

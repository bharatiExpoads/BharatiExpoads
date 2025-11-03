const express = require('express');
const router = express.Router();
const {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  blockAdmin,
  unblockAdmin
} = require('../controllers/superAdminController');
const { auth, isSuperAdmin } = require('../middlewares/auth');

// All routes require authentication and super admin role
router.use(auth);
router.use(isSuperAdmin);

// Admin management routes
router.get('/admins', getAllAdmins);
router.post('/admins/create', createAdmin);
router.patch('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);
router.patch('/admins/:id/block', blockAdmin);
router.patch('/admins/:id/unblock', unblockAdmin);

module.exports = router;
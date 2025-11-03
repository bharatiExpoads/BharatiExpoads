const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { auth, isSuperAdmin } = require('../middlewares/auth');

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
// Create admin users (Super Admin only)
router.post('/admin/create', auth, isSuperAdmin, register);

module.exports = router;
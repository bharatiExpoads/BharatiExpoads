const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { auth, authorize, isSuperAdmin, isAdmin, isOwnResource } = require('../middlewares/auth');

// Public routes - none

// Protected routes - require authentication
router.get('/', auth, authorize('SUPER_ADMIN', 'ADMIN'), getUsers);
router.get('/:id', auth, isOwnResource, getUserById);
router.put('/:id', auth, isOwnResource, updateUser);
router.delete('/:id', auth, isOwnResource, deleteUser);

// Admin-only routes
router.get('/employees/all', auth, isAdmin, getUsers);

// Super Admin-only routes
router.get('/admins/all', auth, isSuperAdmin, getUsers);

module.exports = router;
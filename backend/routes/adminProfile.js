// routes/adminProfileRoutes.js

const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares/auth');
const adminProfileController = require('../controllers/adminProfileController');

router.get('/admin/profile', auth, adminProfileController.getAll);
router.get('/admin/profile/:id', auth, adminProfileController.getById);
router.post('/admin/profile', auth, adminProfileController.create);
router.put('/admin/profile/:id', auth, adminProfileController.update);
router.delete('/admin/profile/:id', auth, adminProfileController.delete);

module.exports = router;

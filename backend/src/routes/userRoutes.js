const express = require('express');
const router = express.Router();
const { getAllUsers, createUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// View staff: accessible by Admin & Manager
router.get('/', authenticate, authorize('Admin', 'Manager'), getAllUsers);

// Create staff: Admin only
router.post('/', authenticate, authorize('Admin'), createUser);

module.exports = router;


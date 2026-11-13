const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// View staff: accessible by Admin & Manager
router.get('/', authenticate, authorize('Admin', 'Manager'), getAllUsers);

// Create staff: Admin only
router.post('/', authenticate, authorize('Admin'), createUser);

// Update staff / admin: Admin only
router.put('/:id', authenticate, authorize('Admin'), updateUser);

// Delete staff: Admin only
router.delete('/:id', authenticate, authorize('Admin'), deleteUser);

module.exports = router;

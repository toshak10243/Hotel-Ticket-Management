const express = require('express');
const router = express.Router();
const {
  createGuestRequest,
  trackGuestRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  getRequestHistory,
} = require('../controllers/requestController');
const { authenticate } = require('../middleware/auth');

// Guest Endpoints (No authentication needed)
router.post('/', createGuestRequest);
router.get('/track/:ticketId', trackGuestRequest);

// Staff / Admin Endpoints (JWT authentication required)
router.get('/', authenticate, getAllRequests);
router.get('/:id', authenticate, getRequestById);
router.patch('/:id', authenticate, updateRequest);
router.get('/:id/history', authenticate, getRequestHistory);

module.exports = router;


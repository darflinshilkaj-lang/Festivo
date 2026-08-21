const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// All notification routes require authentication
router.get('/', authMiddleware, getNotifications);
router.patch('/read-all', authMiddleware, markAllAsRead);
router.patch('/:id/read', authMiddleware, markAsRead);

module.exports = router;

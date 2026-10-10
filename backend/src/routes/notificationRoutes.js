const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;

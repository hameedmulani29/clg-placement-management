const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get current user's notifications
 * GET /api/v1/notifications
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipientId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(Number(limit)),
      Notification.countDocuments({ recipientId: req.user._id, isRead: false }),
    ]);

    return successResponse(res, 200, 'Notifications retrieved.', {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read
 * PATCH /api/v1/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found.');
    }

    return successResponse(res, 200, 'Notification marked as read.', notification);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all user notifications as read
 * PATCH /api/v1/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });
    return successResponse(res, 200, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};

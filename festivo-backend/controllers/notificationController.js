const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Helper to format a notification document for API response
const formatNotification = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    _id: obj._id.toString(),
    userId: obj.userId.toString(),
    type: obj.type,
    title: obj.title,
    message: obj.message,
    read: obj.read,
    eventId: obj.eventId ? obj.eventId.toString() : null,
    registrationId: obj.registrationId ? obj.registrationId.toString() : null,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

// 1. GET ALL NOTIFICATIONS FOR LOGGED-IN USER
const getNotifications = async (req, res) => {
  try {
    const userId = req.user;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);

    const formatted = notifications.map(formatNotification);
    const unreadCount = formatted.filter(n => !n.read).length;

    return res.status(200).json({
      success: true,
      count: formatted.length,
      unreadCount,
      notifications: formatted,
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving notifications',
    });
  }
};

// 2. MARK A SINGLE NOTIFICATION AS READ
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.read) {
      notification.read = true;
      await notification.save();
    }

    return res.status(200).json({
      success: true,
      notification: formatNotification(notification),
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error marking notification as read',
    });
  }
};

// 3. MARK ALL NOTIFICATIONS AS READ FOR LOGGED-IN USER
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user;

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error marking all notifications as read',
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

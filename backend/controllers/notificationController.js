
const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ user: req.user._id })
      .populate('item')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count of notifications for this user
    const total = await Notification.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(total / limit);

    // Calculate unread count
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      isRead: false 
    });

    // Send back the results
    res.status(200).json({
      success: true,
      count: notifications.length,
      total: total,
      totalPages: totalPages,
      unreadCount: unreadCount,
      currentPage: page,
      data: notifications
    });
  } catch (error) {
    console.error('GetNotifications Error:', error);
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    // Find notification and verify it belongs to the logged-in user
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if notification belongs to the current user
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }

    // Update the notification as read
    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('MarkAsRead Error:', error);
    next(error);
  }
};

// Mark all notifications as read for the logged-in user
const markAllAsRead = async (req, res, next) => {
  try {
    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('MarkAllAsRead Error:', error);
    next(error);
  }
};

//Delete a notification
const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    // Find and delete the notification
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if notification belongs to the current user
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    // Delete the notification
    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('DeleteNotification Error:', error);
    next(error);
  }
};

// Export controller functions
module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

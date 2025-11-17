const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Notification = require("../model/notification");
const route = express.Router();

// Get all notifications for logged-in user
route.get("/notifications", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        const query = { recipientId: userId };
        if (unreadOnly === "true") {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .populate("senderId", "firstName lastName photoUrl")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const totalCount = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            recipientId: userId,
            isRead: false,
        });

        res.json({
            success: true,
            data: notifications,
            pagination: {
                total: totalCount,
                unread: unreadCount,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications: " + err.message,
        });
    }
});

// Mark notification(s) as read
route.patch("/notifications/read", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { notificationIds, markAllAsRead } = req.body;

        let result;

        if (markAllAsRead) {
            // Mark all notifications as read
            result = await Notification.updateMany(
                { recipientId: userId, isRead: false },
                { $set: { isRead: true } }
            );
        } else if (notificationIds && Array.isArray(notificationIds)) {
            // Mark specific notifications as read
            result = await Notification.updateMany(
                {
                    _id: { $in: notificationIds },
                    recipientId: userId,
                },
                { $set: { isRead: true } }
            );
        } else {
            return res.status(400).json({
                success: false,
                message: "Either notificationIds array or markAllAsRead flag is required",
            });
        }

        res.json({
            success: true,
            message: "Notifications marked as read",
            modifiedCount: result.modifiedCount,
        });
    } catch (err) {
        console.error("Error marking notifications as read:", err);
        res.status(500).json({
            success: false,
            message: "Failed to mark notifications as read: " + err.message,
        });
    }
});

// Delete notification(s)
route.delete("/notifications", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { notificationIds, deleteAll } = req.body;

        let result;

        if (deleteAll) {
            // Delete all notifications
            result = await Notification.deleteMany({ recipientId: userId });
        } else if (notificationIds && Array.isArray(notificationIds)) {
            // Delete specific notifications
            result = await Notification.deleteMany({
                _id: { $in: notificationIds },
                recipientId: userId,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Either notificationIds array or deleteAll flag is required",
            });
        }

        res.json({
            success: true,
            message: "Notifications deleted successfully",
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        console.error("Error deleting notifications:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete notifications: " + err.message,
        });
    }
});

// Get unread notification count
route.get("/notifications/unread-count", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const count = await Notification.countDocuments({
            recipientId: userId,
            isRead: false,
        });

        res.json({
            success: true,
            count,
        });
    } catch (err) {
        console.error("Error fetching unread count:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch unread count: " + err.message,
        });
    }
});

module.exports = route;

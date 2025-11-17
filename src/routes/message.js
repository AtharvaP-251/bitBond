const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const Message = require("../model/message");
const ConnectionRequest = require("../model/connectionRequest");
const { notifyNewMessage } = require("../utils/notificationHelper");

// Send a message
router.post("/messages/send/:receiverId", userAuth, async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Message text is required" });
        }

        // Verify that users are connected
        const connection = await ConnectionRequest.findOne({
            $or: [
                { fromUserId: senderId, toUserId: receiverId, status: "accepted" },
                { fromUserId: receiverId, toUserId: senderId, status: "accepted" },
            ],
        });

        if (!connection) {
            return res.status(403).json({ message: "You can only message your connections" });
        }

        const message = new Message({
            senderId,
            receiverId,
            text: text.trim(),
        });

        await message.save();

        // Create notification for the receiver
        await notifyNewMessage(
            senderId,
            receiverId,
            req.user.firstName,
            message._id
        );

        res.status(201).json({
            message: "Message sent successfully",
            data: message,
        });
    } catch (err) {
        res.status(400).json({ message: "Something went wrong: " + err.message });
    }
});

// Get conversation with a specific user
router.get("/messages/conversation/:userId", userAuth, async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { userId } = req.params;

        // Verify connection
        const connection = await ConnectionRequest.findOne({
            $or: [
                { fromUserId: currentUserId, toUserId: userId, status: "accepted" },
                { fromUserId: userId, toUserId: currentUserId, status: "accepted" },
            ],
        });

        if (!connection) {
            return res.status(403).json({ message: "You can only view messages with your connections" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId },
            ],
        })
            .sort({ createdAt: 1 })
            .limit(100);

        // Mark messages as read
        await Message.updateMany(
            { senderId: userId, receiverId: currentUserId, isRead: false },
            { isRead: true }
        );

        res.json({ data: messages });
    } catch (err) {
        res.status(400).json({ message: "Something went wrong: " + err.message });
    }
});

// Get all conversations (list of users you've chatted with)
router.get("/messages/conversations", userAuth, async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Get all messages involving the current user
        const messages = await Message.find({
            $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        })
            .sort({ createdAt: -1 })
            .populate("senderId", "firstName lastName photoUrl")
            .populate("receiverId", "firstName lastName photoUrl");

        // Create a map of unique conversations with last message
        const conversationsMap = new Map();

        messages.forEach((msg) => {
            const otherUserId =
                msg.senderId._id.toString() === currentUserId.toString()
                    ? msg.receiverId._id.toString()
                    : msg.senderId._id.toString();

            if (!conversationsMap.has(otherUserId)) {
                const otherUser =
                    msg.senderId._id.toString() === currentUserId.toString()
                        ? msg.receiverId
                        : msg.senderId;

                conversationsMap.set(otherUserId, {
                    user: otherUser,
                    lastMessage: msg.text,
                    lastMessageTime: msg.createdAt,
                    unreadCount: 0,
                });
            }
        });

        // Count unread messages for each conversation
        for (const [userId, conv] of conversationsMap.entries()) {
            const unreadCount = await Message.countDocuments({
                senderId: userId,
                receiverId: currentUserId,
                isRead: false,
            });
            conv.unreadCount = unreadCount;
        }

        const conversations = Array.from(conversationsMap.values()).sort(
            (a, b) => b.lastMessageTime - a.lastMessageTime
        );

        res.json({ data: conversations });
    } catch (err) {
        res.status(400).json({ message: "Something went wrong: " + err.message });
    }
});

module.exports = router;

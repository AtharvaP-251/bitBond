const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["connection_request", "connection_accepted", "message", "profile_view"],
            required: true,
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            // Can reference ConnectionRequest or Message
            required: false,
        },
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;

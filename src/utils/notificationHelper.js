const Notification = require("../model/notification");

/**
 * Create a notification for a user
 * @param {Object} params - Notification parameters
 * @param {String} params.recipientId - ID of the user receiving the notification
 * @param {String} params.senderId - ID of the user who triggered the notification
 * @param {String} params.type - Type of notification (connection_request, connection_accepted, message, profile_view)
 * @param {String} params.message - Notification message
 * @param {String} params.relatedId - Optional ID of related entity (ConnectionRequest, Message, etc.)
 * @param {String} params.link - Optional link to navigate to
 */
async function createNotification({ recipientId, senderId, type, message, relatedId, link }) {
    try {
        const notification = new Notification({
            recipientId,
            senderId,
            type,
            message,
            relatedId,
            link,
        });

        await notification.save();
        return notification;
    } catch (err) {
        console.error("Error creating notification:", err);
        throw err;
    }
}

/**
 * Create a connection request notification
 */
async function notifyConnectionRequest(fromUserId, toUserId, fromUserName, requestId) {
    return createNotification({
        recipientId: toUserId,
        senderId: fromUserId,
        type: "connection_request",
        message: `${fromUserName} sent you a connection request`,
        relatedId: requestId,
        link: "/connections",
    });
}

/**
 * Create a connection accepted notification
 */
async function notifyConnectionAccepted(acceptedByUserId, requestOwnerId, acceptedByUserName, requestId) {
    return createNotification({
        recipientId: requestOwnerId,
        senderId: acceptedByUserId,
        type: "connection_accepted",
        message: `${acceptedByUserName} accepted your connection request`,
        relatedId: requestId,
        link: "/connections",
    });
}

/**
 * Create a new message notification
 */
async function notifyNewMessage(senderId, receiverId, senderName, messageId) {
    return createNotification({
        recipientId: receiverId,
        senderId: senderId,
        type: "message",
        message: `${senderName} sent you a message`,
        relatedId: messageId,
        link: `/messages`,
    });
}

/**
 * Create a profile view notification
 */
async function notifyProfileView(viewerId, profileOwnerId, viewerName) {
    return createNotification({
        recipientId: profileOwnerId,
        senderId: viewerId,
        type: "profile_view",
        message: `${viewerName} viewed your profile`,
        link: "/profile",
    });
}

module.exports = {
    createNotification,
    notifyConnectionRequest,
    notifyConnectionAccepted,
    notifyNewMessage,
    notifyProfileView,
};

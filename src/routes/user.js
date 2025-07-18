const express = require('express');
const userRouter = express.Router();
const ConnectionRequest = require('../model/connectionRequest');
const User = require('../model/user');
const { userAuth } = require("../middlewares/auth");
const { set } = require('mongoose');

USER_SAFE_DATA = "firstName lastName photoUrl age gender about skils";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const receivedRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", ["firstName", "lastName"]);

        res.status(200).json({ "pending requests": receivedRequests });
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
});

userRouter.get("/user/requests/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: "accepted" },
                { toUserId: loggedInUser._id, status: "accepted" }
            ]
        }).populate("fromUserId", USER_SAFE_DATA)
            .populate("toUserId", USER_SAFE_DATA);

        const data = connections.map((row) => {
            if (row.fromUserId._id.equals(loggedInUser._id)) {
                return row.toUserId;
            } else {
                return row.fromUserId;
            }
        });

        res.status(200).json({ data });
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

userRouter.get("/feed", userAuth, async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        const loggedInUser = req.user;

        const userConnections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId")

        const hideUsersFromFeed = new Set();
        userConnections.forEach((row) => {
            if (row.fromUserId.equals(loggedInUser._id)) {
                hideUsersFromFeed.add(row.toUserId.toString());
            } else {
                hideUsersFromFeed.add(row.fromUserId.toString());
            }
        });

        const feedData = await User.find({
            $and: [
                { _id: { $ne: loggedInUser._id } },
                { _id: { $nin: Array.from(hideUsersFromFeed) } }
            ]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.status(200).json({ data: feedData });
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
});

module.exports = userRouter;

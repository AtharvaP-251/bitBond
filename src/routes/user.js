const express = require('express');
const userRouter = express.Router();
const ConnectionRequest = require('../model/connectionRequest');
const { userAuth } = require("../middlewares/auth");

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

module.exports = userRouter;

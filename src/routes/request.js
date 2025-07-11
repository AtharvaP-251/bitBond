const express = require("express");
const { userAuth } = require("../middlewares/auth");
const route = express.Router();
const ConnectionRequest = require("../model/connectionRequest");
const User = require("../model/user");


route.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const status = req.params.status;
        const toUserId = req.params.toUserId;
        const fromUserId = req.user._id;

        const allowed_status = ["ignored", "interested"];
        if (!allowed_status.includes(status)) {
            return res.status(400).send("Invalid status");
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }]
        })

        if (existingConnectionRequest) {
            return res.status(400).send("Connection request already exists");
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).send("User not found");
        }

        const data = new ConnectionRequest({ fromUserId, toUserId, status });
        await data.save();

        res.json({
            message: "Connection request sent successfully",
            data: data
        });

    } catch (err) {
        console.log(err);
        res.status(400).send("Something went wrong: " + err.message);
    }
})

route.post("/review/send/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user
        const { status, requestId } = req.params;

        const allowed_status = ["accepted", "rejected"];
        if (!allowed_status.includes(status)) {
            return res.status(400).send("Invalid status");
        }

        const connectionRequest = await ConnectionRequest.findOne({
            fromUserId: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });

        if (!connectionRequest) {
            return res.status(404).send("Connection request not found");
        }

        connectionRequest.status = status;
        await connectionRequest.save();

        res.json({
            message: "Connection request " + status,
            data: connectionRequest
        });

    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

module.exports = route;
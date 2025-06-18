const express = require("express");
const { userAuth } = require("../middlewares/auth");
const route = express.Router();


route.post("/sendConnectionRequest", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send("Connection request sent from " + user.firstName);
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

module.exports = route;
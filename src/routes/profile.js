const esxpress = require('express');
const route = esxpress.Router();
const { userAuth } = require("../middlewares/auth");
const User = require("../model/user");

route.get("/feed", userAuth, async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

route.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send("Logged in user profile: " + user);
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

module.exports = route;
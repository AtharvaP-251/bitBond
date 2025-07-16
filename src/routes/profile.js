const express = require('express');
const route = express.Router();
const validator = require('validator');
const bcrypt = require("bcrypt");
const User = require("../model/user");
const { userAuth } = require("../middlewares/auth");


route.get("/profile/feed", userAuth, async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

route.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send("Logged in user profile: " + user);
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

route.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        console.log("req.body", req.body);
        const user = req.user;
        const ALLOWED_UPDATES = ["userId", "firstName", "lastName", "emailId", "photoUrl", "about", "gender", "age", "skills"];
        const updates = Object.keys(req.body);
        const isAllowedUpdate = updates.every((update) => ALLOWED_UPDATES.includes(update));

        if (!isAllowedUpdate) {
            return res.status(400).send("Invalid updates");
        }

        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();

        res.send("Profile updated successfully: ");
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

route.patch("/profile/password", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            throw new Error("Please provide both old and new passwords");
        }

        const isPasswordValid = await user.validatePassword(oldPassword);
        if (!isPasswordValid) {
            throw new Error("Old password is incorrect");
        }

        if (!validator.isStrongPassword(newPassword)) {
            throw new Error("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
        }

        user.password = newPassword;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.send("Password updated successfully");
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

module.exports = route;
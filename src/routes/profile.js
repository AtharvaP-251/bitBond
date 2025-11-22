const express = require('express');
const route = express.Router();
const validator = require('validator');
const bcrypt = require("bcrypt");
const User = require("../model/user");
const { userAuth } = require("../middlewares/auth");
const { upload, uploadToCloudinary } = require("../middlewares/upload");


route.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.json({ data: user });
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
});


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
        const ALLOWED_UPDATES = ["userId", "firstName", "lastName", "emailId", "photoUrl", "about", "gender", "age", "skills", "title", "location", "website", "github", "linkedin", "experience", "availability"];
        const updates = Object.keys(req.body);
        const isAllowedUpdate = updates.every((update) => ALLOWED_UPDATES.includes(update));

        if (!isAllowedUpdate) {
            return res.status(400).send("Invalid updates");
        }

        // Convert skills from comma-separated string to array if needed
        if (req.body.skills && typeof req.body.skills === 'string') {
            req.body.skills = req.body.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
        }

        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();

        res.json({ 
            message: "Profile updated successfully",
            data: user 
        });
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

route.post("/profile/upload-photo", userAuth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer);
        
        // Update user's photoUrl
        const user = req.user;
        user.photoUrl = result.secure_url;
        await user.save();

        res.json({ 
            message: "Photo uploaded successfully",
            photoUrl: result.secure_url,
            data: user
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(400).json({ message: "Failed to upload photo: " + err.message });
    }
})

module.exports = route;
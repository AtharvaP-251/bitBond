const express = require("express");
const route = express.Router();
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../model/user");

route.post("/auth/signup", async (req, res) => {
    try {
        validateSignupData(req);
        const { firstName, lastName, emailId, password, age, gender, photoUrl, skills, about } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Convert skills string to array if it's a string
        const skillsArray = typeof skills === 'string' && skills.trim() 
            ? skills.split(',').map(s => s.trim()) 
            : Array.isArray(skills) ? skills : [];

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            age,
            gender,
            photoUrl,
            skills: skillsArray,
            about
        });
        const savedUser = await user.save();
        
        // Create JWT token and set cookie
        const token = await savedUser.getJWT();
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        // Return user data (excluding password)
        const userResponse = savedUser.toObject();
        delete userResponse.password;
        res.json(userResponse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

route.post("/auth/login", async (req, res) => {
    try {

        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId });

        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await user.validatePassword(password);

        if (isPasswordValid) {
            const token = await user.getJWT();
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.send(user);
        }
        else {
            throw new Error("Invalid credentials");
        }
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

route.post("/auth/logout", async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        res.send("Logout successful!");
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
});

module.exports = route;
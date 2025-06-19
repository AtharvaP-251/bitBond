const express = require("express");
const route = express.Router();
const { validateSignupData } = require("../model/utils/validation");
const bcrypt = require("bcrypt");
const User = require("../model/user");

route.post("/auth/signup", async (req, res) => {
    try {
        validateSignupData(req);
        const { firstName, lastName, emailId, password, age, gender, photoUrl, skills } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            age,
            gender,
            photoUrl,
            skills
        });
        await user.save();
        res.send("User added successfully!");
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
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
            res.cookie("token", token);
            res.send("Login successful!");
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
        res.clearCookie("token");
        res.send("Logout successful!");
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
});

module.exports = route;
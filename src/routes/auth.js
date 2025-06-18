const express = require("express");
const route = express.Router();
const { validateSignupData } = require("../model/utils/validation");
const bcrypt = require("bcrypt");
const User = require("../model/user");

route.post("/signup", async (req, res) => {
    try {
        validateSignupData(req);
        const { firstName, lastName, emailId, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("pass:", hashedPassword);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
        });
        await user.save();
        res.send("User added successfully!");
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
});

route.post("/login", async (req, res) => {
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

module.exports = route;
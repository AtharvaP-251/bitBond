const express = require("express");
const connectDB = require("./config/database");
const User = require("./model/user");
const { validateSignupData } = require("./model/utils/validation");
const bcrypt = require("bcrypt");
const user = require("./model/user");
const jwt = require("jsonwebtoken");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            const token = await jwt.sign({ _id: user._id }, "Dev@Tinder#2025");
            // console.log("token:", token);
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

app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

app.get("/user", async (req, res) => {
    try {
        const userEmail = req.body.emailId;
        const user = await User.findOne({ emailId: userEmail });

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.send(user);
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
});

app.get("/profile", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            throw new Error("Unauthorized: Invalid token");
        }
        const decodedMessage = jwt.verify(token, "Dev@Tinder#2025");
        const { _id } = decodedMessage;
        const user = await User.findById(_id);
        if (!user) {
            throw new Error("User not found");
        }

        res.send("Logged in user profile: " + user);
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

app.delete("/user", async (req, res) => {
    userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        res.send("User deleted successfully...");
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

app.patch("/user/:userId", async (req, res) => {
    const _id = req.params?.userId;
    const data = req.body;

    try {
        const ALLOWED_UPDATES = ["userId", "firstName", "lastName", "photoUrl", "about", "gender", "age", "skills"];
        const isUpdateAllowed = Object.keys(data).every((key) => ALLOWED_UPDATES.includes(key));
        if (!isUpdateAllowed) {
            throw new Error("Update not allowed");
        }

        if (data?.skills?.length > 10) {
            throw new Error("Skills cannot be greater than 10");
        }

        const user = await User.findByIdAndUpdate(_id, data, { returnDocument: "after", runValidators: true });
        // console.log(user);
        res.send("Data updated successfully...")

    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
})

connectDB()
    .then(() => {
        console.log("Database connection established...");
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.log("Database connection failed:", err.message);
    });

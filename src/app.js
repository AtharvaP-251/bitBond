require('dotenv').config();
const express = require("express");
const connectDB = require("./config/database");
const User = require("./model/user");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3000;

const authRoute = require("./routes/auth");
const profileRoute = require("./routes/profile");
const requestRoute = require("./routes/request");
const userRoute = require("./routes/user");
const messageRoute = require("./routes/message");
const notificationRoute = require("./routes/notification");
const searchRoute = require("./routes/search");
const cors = require("cors");

const allowedOrigins = [
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") :
        (process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.replace(/\/$/, "") : "http://localhost:5173"),
    "http://localhost:5173"
];

app.use(cors(
    {
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    }
));
app.use(express.json());
app.use(cookieParser());

// Database connection middleware for Vercel
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database Connection Error:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});

app.use("/", authRoute);
app.use("/", profileRoute);
app.use("/", requestRoute);
app.use("/", userRoute);
app.use("/", messageRoute);
app.use("/", notificationRoute);
app.use("/", searchRoute);

app.get("/", (req, res) => {
    res.send("BitBond API is running!");
});

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

// Remove server listen for Vercel
app.get("/api/health", (req, res) => res.send("OK"));

module.exports = app;

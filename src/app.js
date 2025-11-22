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

app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));
app.use(express.json());
app.use(cookieParser());

app.use("/", authRoute);
app.use("/", profileRoute);
app.use("/", requestRoute);
app.use("/", userRoute);
app.use("/", messageRoute);
app.use("/", notificationRoute);
app.use("/", searchRoute);

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

// Create HTTP server and Socket.IO setup
const http = require("http");
const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

connectDB()
    .then(() => {
        console.log("Database connection established...");

        const server = http.createServer(app);

        const io = new Server(server, {
            cors: {
                origin: "http://localhost:5173",
                credentials: true
            }
        });

        // Socket authentication middleware
        io.use((socket, next) => {
            try {
                const cookies = cookie.parse(socket.handshake.headers.cookie || "");
                const token = cookies.token;
                if (!token) throw new Error("Invalid token");
                const decoded = jwt.verify(token, "Dev@Tinder#2025");
                socket.userId = decoded._id?.toString();
                if (!socket.userId) throw new Error("Invalid user");
                next();
            } catch (err) {
                next(new Error("Unauthorized"));
            }
        });

        io.on("connection", (socket) => {
            console.log(`User connected: ${socket.userId}`);
            // Join a private room based on userId for targeted events
            socket.join(socket.userId);

            socket.on("disconnect", () => {
                console.log(`User disconnected: ${socket.userId}`);
            });
        });

        // Make io available to routes
        app.set("io", io);

        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.log("Database connection failed:", err.message);
    });

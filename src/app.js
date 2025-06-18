const express = require("express");
const connectDB = require("./config/database");
const User = require("./model/user");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 3000;
const authRoute = require("./routes/auth");
const profileRoute = require("./routes/profile");
const requestRoute = require("./routes/request");

app.use(express.json());
app.use(cookieParser());

app.use("/", authRoute);
app.use("/", profileRoute);
app.use("/", requestRoute);

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

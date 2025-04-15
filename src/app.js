const express = require("express");
const connectDB = require("./config/database");
const User = require("./model/user");

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/signup", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.send("User added successfully!");
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
});

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
        console.log(user);
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

const express = require("express");
const connectDB = require("./config/database");
const User = require("./model/user");

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/signup", async (req, res) => {
    const user = new User(req.body);

    await user.save();
    res.send("User added successfully!");
})

app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        res.status(400).send("Something went wrong...");
    }
})

app.get("/user", async (req, res) => {
    const userEmail = req.body.emailId;
    const user = await User.findOne({ emailId: userEmail })

    if (user == null)
        res.status(400).send("Something went wrong...");
    else
        res.send(user);
})

app.delete("/user", async (req, res) => {
    userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        res.send("User deleted successfully...");
    } catch (err) {
        res.status(400).send("Something went wrong...");
    }
})

app.patch("/user", async (req, res) => {
    const _id = req.body.userId;
    const data = req.body;
    try {
        const user = await User.findByIdAndUpdate(_id, data, { returnDocument: "after" })
        console.log(user);
        res.send("Data updated successfully...")
    } catch (err) {
        res.status(400).send("Something went wrong...");
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
        console.log("Database connection failed...", err.message);
    });

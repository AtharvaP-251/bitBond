const express = require("express");
const connectDB = require("./config/database");

const app = express();
const PORT = 3000;

// const { adminAuth } = require("./middlewares/adminAuth")

// app.get("/",
//     (req, res, next) => {
//         // res.send("Hello World 1st");
//         next();
//     },
//     (req, res, next) => {
//         // res.send("Hello World 2nd");
//         next();
//     },
//     (req, res) => {
//         res.send("Hello World 3rd");
//     }
// );

// app.use("/admin", adminAuth)

// app.use("/", (err, req, res) => {
//     res.status(500).send("Error please contact team");
// })

// app.get("/admin/getAllData", (req, res) => {

//     try {
//         throw ("abc");
//         res.send("All data sent");
//     } catch (err) {
//         res.status(500).send("Some Error occured");
//     }
// })

// app.get("/admin/deleteUser", (req, res) => {
//     res.send("Deleted a user");
// })

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

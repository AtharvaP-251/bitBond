const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DB || "bitBond",
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("New database connection established");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};

module.exports = connectDB;
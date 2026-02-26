const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB || "bitBond"
    });
};

module.exports = connectDB;
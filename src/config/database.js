const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://namastedev:epTpyXixLZc3Yeqn@namastenode.pqnxy.mongodb.net/devTinder"
    );
};

module.exports = connectDB;
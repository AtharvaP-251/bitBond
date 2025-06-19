const jwt = require("jsonwebtoken");
const User = require("../model/user");

const adminAuth = (req, res, next) => {
    const token = "xyz";
    const isAdminAuthorised = token == "xyz"
    if (!isAdminAuthorised)
        res.status(401).send("Unauthorized Request");
    else
        next();
};

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            throw new Error("Invalid token");
        }

        const decodedMessage = jwt.verify(token, "Dev@Tinder#2025");
        const { _id } = decodedMessage;

        const user = await User.findById(_id);
        if (!user) {
            throw new Error("User not found");
        }
        req.user = user; // Attach user info to request object
        next();
    } catch (err) {
        res.status(400).send("Something went wrong: " + err.message);
    }
}

module.exports = {
    adminAuth,
    userAuth
};
const validator = require('validator');

const validateSignupData = (req) => {

    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName || !emailId || !password) {
        throw new Error("All fields are required");
    }

    if (typeof firstName !== 'string' || typeof lastName !== 'string') {
        throw new Error("First name and last name must be strings");
    }

    if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email format");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    // Password strength validation removed to allow simple passwords for development
}

module.exports = {
    validateSignupData,
};
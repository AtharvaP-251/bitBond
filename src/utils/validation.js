const validator = require('validator');

const validateSignupData = (req) => {

    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName || !emailId || !password) {
        return { isValid: false, message: "All fields are required" };
    }

    if (typeof firstName !== 'string' || typeof lastName !== 'string') {
        return { isValid: false, message: "First name and last name must be strings" };
    }

    if (!validator.isEmail(emailId)) {
        return { isValid: false, message: "Invalid email format" };
    }

    if (password.length < 6) {
        return { isValid: false, message: "Password must be at least 6 characters long" };
    }

    if (validator.isStrongPassword(password)) {
        return { isValid: false, message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" };
    }
}

module.exports = {
    validateSignupData,
};
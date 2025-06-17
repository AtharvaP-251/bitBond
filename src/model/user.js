const mongoose = require("mongoose");
const { Schema } = mongoose;
var validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 4,
            maxLength: 50,
        },

        lastName: {
            type: String,
        },

        emailId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email is invalid..." + value);
                }
            }
        },

        password: {
            type: String,
            required: true,
            validate(value) {
                if (!validator.isStrongPassword(value)) {
                    throw new Error("Enter a strong password...");
                }
            }
        },

        age: {
            type: Number,
            min: 18,
        },

        gender: {
            type: String,
            validate(value) {
                if (!["male", "female", "other"].includes(value)) {
                    throw new Error("Gender data is invalid...");
                }
            },
        },

        photoUrl: {
            type: String,
            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error("Photo url is invalid..." + value);
                }
            }
        },

        about: {
            type: String,
            default: "This is deafult about",
        },

        skills: {
            type: [String],
        },
    },

    {
        timestamps: true,
    }
)

userSchema.methods.getJWT = function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, "Dev@Tinder#2025", { expiresIn: "7d" });
    return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);

    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }

    return isPasswordValid;
}

module.exports = mongoose.model('User', userSchema);
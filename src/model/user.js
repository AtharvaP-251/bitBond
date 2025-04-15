const mongoose = require("mongoose");
const { Schema } = mongoose;
var validator = require("validator");

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

module.exports = mongoose.model('User', userSchema);
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
                if (value && !["male", "female", "other"].includes(value)) {
                    throw new Error("Gender data is invalid...");
                }
            },
        },

        photoUrl: {
            type: String,
            validate(value) {
                if (value && !validator.isURL(value)) {
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

        title: {
            type: String,
            maxLength: 100,
        },

        location: {
            type: String,
            maxLength: 100,
        },
        
        experience: {
            type: Number,
            min: 0,
            max: 50,
        },
        
        availability: {
            type: String,
            enum: ['available', 'busy', 'not-looking'],
        },

        website: {
            type: String,
            validate(value) {
                if (value && value.trim() !== '' && !validator.isURL(value)) {
                    throw new Error("Website URL is invalid: " + value);
                }
            }
        },

        github: {
            type: String,
            maxLength: 200,
        },

        linkedin: {
            type: String,
            maxLength: 200,
        },
    },

    {
        timestamps: true,
    }
)

// Text indexing for search functionality
userSchema.index({ 
    firstName: 'text', 
    lastName: 'text', 
    about: 'text',
    skills: 'text'
});

// Index for location and experience searches
userSchema.index({ location: 1, experience: 1 });

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
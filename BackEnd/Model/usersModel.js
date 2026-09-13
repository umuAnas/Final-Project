import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        emailAddress: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        birthDate: {
            type: String,
            required: true
        },

        gender: {
            type: String,
            enum: ["male", "female"]
        },

        academicBackground: {
            type: String,
            required: true
        },

        selectSupportType: [
            {
                type: String,
                enum: ["Online", "In-person", "none"]
            }
        ],

        password: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["active", "blocked","finished","left"],
            default: "active"
        },

        role: {
            type: String,
            enum: [
                "student",
                "admin",
                "instructor",
            ],
            default: "student"
        },

        passwordResetToken: {
            type: String
        },

        passwordResetExpires: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;
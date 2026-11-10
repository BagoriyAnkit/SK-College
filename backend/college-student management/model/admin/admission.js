const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
    {
        studentName: {
            type: String,
            required: true,
            trim: true
        },

        fatherName: {
            type: String,
            default: "",
            trim: true
        },

        motherName: {
            type: String,
            default: "",
            trim: true
        },

        parentMobile: {
            type: String,
            default: "",
            trim: true
        },

        gender: {
            type: String,
            default: ""
        },

        DOB: Date,

        mobile: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        aadhaar: {
            type: String,
            default: ""
        },

        address: {
            type: String,
            default: ""
        },

        city: {
            type: String,
            default: "",
            trim: true
        },

        state: {
            type: String,
            default: "",
            trim: true
        },

        pincode: {
            type: String,
            default: "",
            trim: true
        },

        courseName: {
            type: String,
            required: true,
            trim: true
        },

        session: {
            type: String,
            default: ""
        },

        admissionDate: {
            type: Date,
            default: Date.now
        },

        qualification: {
            type: String,
            default: ""
        },

        board: {
            type: String,
            default: ""
        },

        passingYear: Number,

        percentage: {
            type: String,
            default: ""
        },

        photo: {
            type: String,
            default: ""
        },

        signature: {
            type: String,
            default: ""
        },

        marksheet: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["Pending", "approved", "rejected", "Active", "Inactive"],
            default: "Pending"
        },

        // Reference to created academic Student record once approved
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "student",
            default: null
        },

        // Reference to created authentication User account once approved
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        rejectionReason: {
            type: String,
            default: ""
        },

        // Notification flags for admin notification tracking and duplicate prevention
        adminNotificationSent: {
            type: Boolean,
            default: false
        },

        adminNotificationSentAt: {
            type: Date,
            default: null
        }

    }, { timestamps: true });

const admission = mongoose.model("admission", admissionSchema);

module.exports = admission;

const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [0, "Payment amount cannot be negative"]
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Net Banking", "Cheque", "Online", "Draft", "Other"],
      default: "Cash"
    },
    transactionId: {
      type: String,
      default: "",
      trim: true
    },
    receiptNo: {
      type: String,
      default: "",
      trim: true
    },
    balance: {
      type: Number,
      default: 0
    },
    remarks: {
      type: String,
      default: "",
      trim: true
    },
    paidBy: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const feesSchema = new mongoose.Schema(
  {
    // 1. Link fee records using the actual Student ID
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: false,
      index: true
    },

    studentName: {
      type: String,
      required: true,
      trim: true
    },

    courseName: {
      type: String,
      required: true,
      trim: true
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: false
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    totalFees: {
      type: Number,
      required: true,
      min: 0
    },

    dueAmount: {
      type: Number,
      default: 0
    },

    paymentDate: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["Pending", "Partial", "Paid", "Active", "Inactive"],
      default: "Pending"
    },

    // 3. Store each payment separately with amount, date, and payment details
    payments: [paymentTransactionSchema]
  },
  { timestamps: true }
);

const fees = mongoose.model("fees", feesSchema);

module.exports = fees;

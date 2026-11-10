const mongoose = require("mongoose");
const fees = require("../../model/admin/fees");
const studentModel = require("../../model/admin/student");
const admissionModel = require("../../model/admin/admission");

/**
 * Resolves student information (studentId, studentName, courseName)
 * accurately from either the student collection or the admission collection.
 */
const resolveStudentInfo = async (studentIdOrName) => {
  if (!studentIdOrName) {
    return { studentId: null, studentName: "Student", courseName: "" };
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(studentIdOrName);

  if (isObjectId) {
    const objId = new mongoose.Types.ObjectId(studentIdOrName);

    // 1. Check academic student collection first
    const stu = await studentModel.findById(objId);
    if (stu) {
      return {
        studentId: stu._id,
        studentName: stu.StudentName || "Student",
        courseName: stu.Course || ""
      };
    }

    // 2. Check admission collection
    const adm = await admissionModel.findById(objId);
    if (adm) {
      return {
        studentId: adm.studentId || adm._id,
        studentName: adm.studentName || "Student",
        courseName: adm.courseName || ""
      };
    }
  }

  // Not an ObjectId or not found by ID: resolve by name string
  const nameStr = String(studentIdOrName).trim();
  const stuByName = await studentModel.findOne({
    StudentName: new RegExp(`^${nameStr}$`, "i")
  });
  if (stuByName) {
    return {
      studentId: stuByName._id,
      studentName: stuByName.StudentName,
      courseName: stuByName.Course || ""
    };
  }

  const admByName = await admissionModel.findOne({
    studentName: new RegExp(`^${nameStr}$`, "i")
  });
  if (admByName) {
    return {
      studentId: admByName.studentId || admByName._id,
      studentName: admByName.studentName,
      courseName: admByName.courseName || ""
    };
  }

  return {
    studentId: isObjectId ? new mongoose.Types.ObjectId(studentIdOrName) : null,
    studentName: isObjectId ? "Student" : nameStr,
    courseName: ""
  };
};

/**
 * Generates a guaranteed unique receipt number in format REC-YYYY-XXXXXX
 */
const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 25; attempt++) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const candidate = `REC-${year}-${randomDigits}`;
    const exists = await fees.findOne({ "payments.receiptNo": candidate });
    if (!exists) {
      return candidate;
    }
  }
  const timestampPart = Date.now().toString().slice(-6);
  const salt = Math.floor(10 + Math.random() * 90);
  return `REC-${year}-${timestampPart}${salt}`;
};

/**
 * Checks if a receipt number is already used in the database.
 */
const isReceiptNumberTaken = async (receiptNo, excludePaymentId = null) => {
  if (!receiptNo) return false;
  const trimmed = String(receiptNo).trim();
  const existingFee = await fees.findOne({ "payments.receiptNo": trimmed });
  if (!existingFee) return false;
  if (!excludePaymentId) return true;
  return existingFee.payments.some(
    (p) => String(p.receiptNo).trim() === trimmed && String(p._id) !== String(excludePaymentId)
  );
};

/**
 * Formats a fee document and a specific payment transaction into complete receipt details.
 */
const buildReceiptDetails = (feeDoc, payment, paymentIndex = 0) => {
  const fObj = feeDoc.toObject ? feeDoc.toObject() : feeDoc;
  const pObj = payment.toObject ? payment.toObject() : payment;

  const payable = Math.max(0, Number(fObj.totalFees || 0) - Number(fObj.discount || 0));

  // Determine running remaining balance after this payment
  let remainingBalance = pObj.balance;
  if (remainingBalance === undefined || remainingBalance === null) {
    let cumulative = 0;
    const paymentList = fObj.payments || [];
    for (let i = 0; i <= paymentIndex && i < paymentList.length; i++) {
      cumulative += Number(paymentList[i].amount || 0);
    }
    remainingBalance = Math.max(0, payable - cumulative);
  }

  const studentDisplayName =
    (fObj.studentId && fObj.studentId.StudentName) ||
    fObj.studentName ||
    fObj.StudentName ||
    "Student";

  return {
    receiptNo:
      pObj.receiptNo ||
      `REC-${new Date().getFullYear()}-${pObj._id ? pObj._id.toString().slice(-6) : "000000"}`,
    feeId: fObj._id,
    paymentId: pObj._id,
    installmentNo: paymentIndex + 1,
    studentId: fObj.studentId?._id || fObj.studentId || null,
    studentName: studentDisplayName,
    rollNumber: fObj.studentId?.RollNumber || fObj.studentId?.rollNumber || "",
    email: fObj.studentId?.email || "",
    phoneNumber: fObj.studentId?.Phonenumber || fObj.studentId?.phoneNumber || "",
    courseName: fObj.courseName || (fObj.studentId && fObj.studentId.Course) || "N/A",
    totalFees: Number(fObj.totalFees || 0),
    discount: Number(fObj.discount || 0),
    payableAmount: payable,
    amountPaid: Number(pObj.amount || 0),
    remainingBalance: Number(remainingBalance),
    dueAmount: Number(remainingBalance),
    paymentDate: pObj.paymentDate || pObj.createdAt || new Date(),
    paymentMode: pObj.paymentMode || "Cash",
    transactionId: pObj.transactionId || "",
    remarks: pObj.remarks || "",
    paidBy: pObj.paidBy || studentDisplayName,
    overallPaidAmount: Number(fObj.paidAmount || 0),
    overallStatus: fObj.status || (remainingBalance <= 0 ? "Paid" : "Partial")
  };
};

/**
 * Add or Record Fees:
 * - Links using actual Student ID
 * - If an existing fee record exists for the student, records an installment
 *   without corrupting or overwriting the student's total course fee!
 * - Stores each payment transaction separately in the payments array.
 */
const addFees = async (req, res) => {
  try {
    const {
      studentId: rawStudentId,
      studentName: rawStudentName,
      courseName: rawCourseName,
      courseId,
      totalFees: rawTotalFees,
      discount: rawDiscount,
      paidAmount: rawPaidAmount,
      paymentDate,
      paymentMode,
      transactionId,
      receiptNo,
      remarks,
      paidBy,
      status: reqStatus
    } = req.body;

    const resolved = await resolveStudentInfo(rawStudentId || rawStudentName);
    const finalStudentId =
      resolved.studentId ||
      (mongoose.Types.ObjectId.isValid(rawStudentId)
        ? new mongoose.Types.ObjectId(rawStudentId)
        : null);

    const finalStudentName =
      (resolved.studentName && resolved.studentName !== "Student"
        ? resolved.studentName
        : null) ||
      (rawStudentName && !mongoose.Types.ObjectId.isValid(rawStudentName)
        ? rawStudentName
        : null) ||
      resolved.studentName ||
      "Student";

    const finalCourseName = rawCourseName || resolved.courseName || "General Course";
    const installmentPaid = Number(rawPaidAmount || 0);

    // Look for an existing fee record for this student
    let existingFee = null;
    if (finalStudentId) {
      existingFee = await fees
        .findOne({ studentId: finalStudentId })
        .sort({ createdAt: -1 });
    }
    if (!existingFee && finalStudentName && finalStudentName !== "Student") {
      existingFee = await fees
        .findOne({ studentName: finalStudentName })
        .sort({ createdAt: -1 });
    }

    if (existingFee) {
      // 2. Fix partial payments: Never overwrite the student's total course fee!
      const currentPaid = Number(existingFee.paidAmount || 0);
      const newCumulativePaid = currentPaid + installmentPaid;
      existingFee.paidAmount = newCumulativePaid;

      if (!existingFee.studentId && finalStudentId) {
        existingFee.studentId = finalStudentId;
      }
      if (
        finalStudentName &&
        (mongoose.Types.ObjectId.isValid(existingFee.studentName) || !existingFee.studentName)
      ) {
        existingFee.studentName = finalStudentName;
      }

      // Recompute dueAmount from original total course fee minus discount
      const payable = Math.max(
        0,
        Number(existingFee.totalFees) - Number(existingFee.discount || 0)
      );
      existingFee.dueAmount = Math.max(0, payable - newCumulativePaid);
      existingFee.status =
        existingFee.dueAmount <= 0
          ? "Paid"
          : newCumulativePaid > 0
          ? "Partial"
          : "Pending";

      if (paymentDate) {
        existingFee.paymentDate = paymentDate;
      }

      // 3. Store each payment separately with amount, date, and payment details
      if (installmentPaid > 0) {
        if (receiptNo && (await isReceiptNumberTaken(receiptNo))) {
          return res.status(400).json({
            status: false,
            statusCode: 400,
            message: `Receipt number '${receiptNo}' already exists. Receipt numbers must be unique.`
          });
        }
        const finalReceiptNo = receiptNo ? receiptNo.trim() : await generateReceiptNumber();

        existingFee.payments.push({
          amount: installmentPaid,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          paymentMode: paymentMode || "Cash",
          transactionId: transactionId || "",
          receiptNo: finalReceiptNo,
          balance: existingFee.dueAmount,
          remarks: remarks || `Installment payment of ₹${installmentPaid}`,
          paidBy: paidBy || finalStudentName
        });
      }

      await existingFee.save();

      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Fee installment recorded successfully",
        data: existingFee
      });
    }

    // New fee record creation
    const totalFees = Number(rawTotalFees || 0);
    const discount = Number(rawDiscount || 0);
    const payable = Math.max(0, totalFees - discount);
    const dueAmount = Math.max(0, payable - installmentPaid);
    const status =
      reqStatus ||
      (dueAmount <= 0 ? "Paid" : installmentPaid > 0 ? "Partial" : "Pending");

    const payments = [];
    if (installmentPaid > 0) {
      if (receiptNo && (await isReceiptNumberTaken(receiptNo))) {
        return res.status(400).json({
          status: false,
          statusCode: 400,
          message: `Receipt number '${receiptNo}' already exists. Receipt numbers must be unique.`
        });
      }
      const finalReceiptNo = receiptNo ? receiptNo.trim() : await generateReceiptNumber();

      payments.push({
        amount: installmentPaid,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMode: paymentMode || "Cash",
        transactionId: transactionId || "",
        receiptNo: finalReceiptNo,
        balance: dueAmount,
        remarks: remarks || "Initial payment",
        paidBy: paidBy || finalStudentName
      });
    }

    const feesData = await fees.create({
      studentId: finalStudentId,
      studentName: finalStudentName,
      courseName: finalCourseName,
      courseId: courseId || null,
      totalFees,
      discount,
      paidAmount: installmentPaid,
      dueAmount,
      paymentDate: paymentDate || new Date(),
      status,
      payments
    });

    return res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Fees added successfully",
      data: feesData
    });
  } catch (error) {
    console.error("ADD FEES ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to add fees"
    });
  }
};

/**
 * Record an installment directly on an existing fee record.
 */
const addPaymentInstallment = async (req, res) => {
  try {
    const { id } = req.params;
    const feeDoc = await fees.findById(id);
    if (!feeDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Fee record not found"
      });
    }

    const amount = Number(req.body.amount ?? req.body.paidAmount ?? 0);
    if (amount <= 0) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Payment installment amount must be greater than 0"
      });
    }

    const reqReceipt = req.body.receiptNo ? String(req.body.receiptNo).trim() : "";
    if (reqReceipt && (await isReceiptNumberTaken(reqReceipt))) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: `Receipt number '${reqReceipt}' already exists. Receipt numbers must be unique.`
      });
    }
    const finalReceiptNo = reqReceipt || (await generateReceiptNumber());

    feeDoc.paidAmount = Number(feeDoc.paidAmount || 0) + amount;

    // Never overwrite totalFees!
    const payable = Math.max(
      0,
      Number(feeDoc.totalFees) - Number(feeDoc.discount || 0)
    );
    feeDoc.dueAmount = Math.max(0, payable - feeDoc.paidAmount);
    feeDoc.status = feeDoc.dueAmount <= 0 ? "Paid" : "Partial";

    const paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();
    feeDoc.paymentDate = paymentDate;

    const newPayment = {
      amount,
      paymentDate,
      paymentMode: req.body.paymentMode || "Cash",
      transactionId: req.body.transactionId || "",
      receiptNo: finalReceiptNo,
      balance: feeDoc.dueAmount,
      remarks: req.body.remarks || `Installment payment of ₹${amount}`,
      paidBy: req.body.paidBy || feeDoc.studentName
    };

    feeDoc.payments.push(newPayment);

    await feeDoc.save();

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Payment installment recorded successfully",
      data: feeDoc
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error recording payment installment"
    });
  }
};

/**
 * View All Fees with pagination and resolved student details.
 */
const viewAllFees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalFees = await fees.countDocuments();
    const feesList = await fees
      .find()
      .populate("studentId", "StudentName email Phonenumber Course")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const formattedData = await Promise.all(
      feesList.map(async (doc) => {
        const item = doc.toObject();

        // 5. Ensure fee records display correct student details
        if (mongoose.Types.ObjectId.isValid(item.studentName)) {
          const resolved = await resolveStudentInfo(item.studentName);
          item.studentName = resolved.studentName;
          if (!item.studentId && resolved.studentId) {
            item.studentId = resolved.studentId;
          }
        } else if (item.studentId && item.studentId.StudentName) {
          item.studentName = item.studentId.StudentName;
        }

        // Support both lowercase and PascalCase property conventions
        item.StudentName = item.studentName;
        return item;
      })
    );

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Fees fetched successfully",
      data: formattedData,
      totalFees,
      totalPages: Math.ceil(totalFees / limit),
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error("VIEW ALL FEES ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error fetching fees"
    });
  }
};

/**
 * Update Fees: updates payload fields without dropping studentId or corrupting records.
 */
const updateFees = async (req, res) => {
  try {
    const { id } = req.params;
    const feeDoc = await fees.findById(id);

    if (!feeDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Fee record not found"
      });
    }

    const {
      studentId,
      studentName,
      courseName,
      totalFees,
      discount,
      paidAmount,
      paymentDate,
      status
    } = req.body;

    if (totalFees !== undefined) feeDoc.totalFees = Number(totalFees);
    if (discount !== undefined) feeDoc.discount = Number(discount);
    if (paidAmount !== undefined) feeDoc.paidAmount = Number(paidAmount);
    if (courseName) feeDoc.courseName = courseName;
    if (paymentDate) feeDoc.paymentDate = paymentDate;

    // Resolve student info if provided
    if (studentId || studentName) {
      const resolved = await resolveStudentInfo(studentId || studentName);
      if (resolved.studentId) feeDoc.studentId = resolved.studentId;
      if (resolved.studentName && resolved.studentName !== "Student") {
        feeDoc.studentName = resolved.studentName;
      }
    }

    // Recalculate dueAmount
    const payable = Math.max(
      0,
      Number(feeDoc.totalFees) - Number(feeDoc.discount || 0)
    );
    feeDoc.dueAmount = Math.max(0, payable - Number(feeDoc.paidAmount || 0));

    if (status) {
      feeDoc.status = status;
    } else {
      feeDoc.status =
        feeDoc.dueAmount <= 0
          ? "Paid"
          : Number(feeDoc.paidAmount || 0) > 0
          ? "Partial"
          : "Pending";
    }

    await feeDoc.save();

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "fees updated successfully",
      data: feeDoc
    });
  } catch (error) {
    console.error("UPDATE FEES ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error updating fees"
    });
  }
};

/**
 * Find One Fee record with populated student details.
 */
const findOneFees = async (req, res) => {
  try {
    const { id } = req.params;
    const feeDoc = await fees
      .findById(id)
      .populate("studentId", "StudentName email Phonenumber Course");

    if (!feeDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "fees not found"
      });
    }

    const item = feeDoc.toObject();
    if (mongoose.Types.ObjectId.isValid(item.studentName)) {
      const resolved = await resolveStudentInfo(item.studentName);
      item.studentName = resolved.studentName;
      if (!item.studentId && resolved.studentId) {
        item.studentId = resolved.studentId;
      }
    } else if (item.studentId && item.studentId.StudentName) {
      item.studentName = item.studentId.StudentName;
    }

    item.StudentName = item.studentName;

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "fees find successfully",
      data: item
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error finding fees"
    });
  }
};

/**
 * Delete Fee record.
 */
const deletefees = async (req, res) => {
  try {
    const { id } = req.params;
    const feesData = await fees.findByIdAndDelete(id);

    if (!feesData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Fee record not found"
      });
    }

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Fees deleted successfully",
      data: feesData
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error deleting fees"
    });
  }
};

/**
 * Retrieve receipt details by unique receipt number.
 */
const getReceiptByNumber = async (req, res) => {
  try {
    const { receiptNo } = req.params;
    if (!receiptNo) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Receipt number is required"
      });
    }

    const trimmed = String(receiptNo).trim();
    const feeDoc = await fees
      .findOne({ "payments.receiptNo": trimmed })
      .populate("studentId", "StudentName email Phonenumber Course RollNumber rollNumber");

    if (!feeDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: `Receipt '${receiptNo}' not found`
      });
    }

    const paymentIndex = feeDoc.payments.findIndex(
      (p) => String(p.receiptNo).trim() === trimmed
    );

    if (paymentIndex === -1) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: `Payment matching receipt '${receiptNo}' not found`
      });
    }

    const payment = feeDoc.payments[paymentIndex];
    const receiptData = buildReceiptDetails(feeDoc, payment, paymentIndex);

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Receipt fetched successfully",
      data: receiptData
    });
  } catch (error) {
    console.error("GET RECEIPT ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error fetching receipt"
    });
  }
};

/**
 * Retrieve receipt details for a specific payment in a fee record.
 */
const getPaymentReceipt = async (req, res) => {
  try {
    const { id, paymentId } = req.params;
    const feeDoc = await fees
      .findById(id)
      .populate("studentId", "StudentName email Phonenumber Course RollNumber rollNumber");

    if (!feeDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Fee record not found"
      });
    }

    let paymentIndex = feeDoc.payments.findIndex(
      (p) => String(p._id) === String(paymentId) || String(p.receiptNo) === String(paymentId)
    );

    if (paymentIndex === -1 && !isNaN(paymentId)) {
      const idx = parseInt(paymentId, 10);
      if (idx >= 0 && idx < feeDoc.payments.length) {
        paymentIndex = idx;
      }
    }

    if (paymentIndex === -1) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Payment transaction not found in fee record"
      });
    }

    const payment = feeDoc.payments[paymentIndex];
    const receiptData = buildReceiptDetails(feeDoc, payment, paymentIndex);

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Payment receipt fetched successfully",
      data: receiptData
    });
  } catch (error) {
    console.error("GET PAYMENT RECEIPT ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error fetching payment receipt"
    });
  }
};

module.exports = {
  addFees,
  addPaymentInstallment,
  viewAllFees,
  updateFees,
  deletefees,
  findOneFees,
  getReceiptByNumber,
  getPaymentReceipt,
  generateReceiptNumber
};

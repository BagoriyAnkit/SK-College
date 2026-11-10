const crypto = require("crypto");
const admission = require("../../model/admin/admission");
const Student = require("../../model/admin/student");
const User = require("../../model/fronted/register");
const { linkStudentToUser } = require("../../utils/accountLinker");
const sendMail = require("../../utils/sendMail");

// ================= ADD ADMISSION (ADMIN PANEL DIRECT) =================
const addAdmission = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                status: false,
                message: "Email is required",
            });
        }

        // Check if pending or approved admission with same email exists
        const existingAdmission = await admission.findOne({
            email,
            status: { $in: ["Pending", "approved"] }
        });

        if (existingAdmission) {
            return res.status(400).json({
                status: false,
                message: `An admission with this email already exists (status: ${existingAdmission.status})`,
            });
        }

        const photo = req.files?.photo?.[0]?.filename || req.body.photo || "";
        const signature = req.files?.signature?.[0]?.filename || req.body.signature || "";
        const marksheet = req.files?.marksheet?.[0]?.filename || req.body.marksheet || "";

        const admissionData = await admission.create({
            ...req.body,
            email,
            photo,
            signature,
            marksheet,
            status: req.body.status || "Pending",
        });

        return res.status(201).json({
            status: true,
            message: "Admission record created successfully",
            data: admissionData,
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// ================= FIND BY ID =================
const findAdmission = async (req, res) => {
    try {
        const { id } = req.params;
        const admissionData = await admission.findById(id).populate("studentId").populate("userId");
        if (!admissionData) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Admission not found"
            });
        }
        res.json({
            status: true,
            statusCode: 200,
            message: "Admission found successfully",
            data: admissionData
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: error.message
        });
    }
};

// ================= FIND ALL =================
const findAllAdmission = async (req, res) => {
    try {
        const admissionData = await admission.find().sort({ createdAt: -1 });
        res.json({
            status: true,
            statusCode: 200,
            message: "Found all admissions successfully",
            data: admissionData
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: error.message
        });
    }
};

// ================= UPDATE ADMISSION =================
const updateAdmission = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (req.files?.photo?.[0]?.filename) {
            updateData.photo = req.files.photo[0].filename;
        }
        if (req.files?.signature?.[0]?.filename) {
            updateData.signature = req.files.signature[0].filename;
        }
        if (req.files?.marksheet?.[0]?.filename) {
            updateData.marksheet = req.files.marksheet[0].filename;
        }
        if (updateData.email) {
            updateData.email = updateData.email.toLowerCase().trim();
        }

        const admissionData = await admission.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!admissionData) {
            return res.status(404).json({
                status: false,
                message: "Admission not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Admission updated successfully",
            data: admissionData
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// ================= APPROVE ADMISSION =================
const approveAdmission = async (req, res) => {
    try {
        const { id } = req.params;

        const admissionData = await admission.findById(id);

        if (!admissionData) {
            return res.status(404).json({
                status: false,
                message: "Admission record not found"
            });
        }

        if (admissionData.status === "approved") {
            return res.status(400).json({
                status: false,
                message: "This admission application has already been approved."
            });
        }

        const cleanEmail = (admissionData.email || "").toLowerCase().trim();
        if (!cleanEmail) {
            return res.status(400).json({
                status: false,
                message: "Admission application does not contain a valid email address."
            });
        }

        // Check if an account already exists in users or students to prevent duplicate accounts
        const existingUser = await User.findOne({ email: cleanEmail });
        const existingStudent = await Student.findOne({ email: cleanEmail });

        if (existingUser && existingUser.studentId) {
            return res.status(409).json({
                status: false,
                message: `A registered student account with email ${cleanEmail} already exists.`
            });
        }

        if (existingStudent && existingStudent.userId) {
            return res.status(409).json({
                status: false,
                message: `An academic student profile with email ${cleanEmail} already exists.`
            });
        }

        // 1. Create Academic Student Profile
        const phoneDigits = admissionData.mobile ? String(admissionData.mobile).replace(/\D/g, "") : "";
        let newStudent;
        if (existingStudent) {
            newStudent = existingStudent;
            newStudent.status = "Active";
            await newStudent.save();
        } else {
            newStudent = await Student.create({
                StudentName: admissionData.studentName,
                email: cleanEmail,
                Phonenumber: phoneDigits ? Number(phoneDigits) : undefined,
                Course: admissionData.courseName,
                address: admissionData.address || "",
                dob: admissionData.DOB || undefined,
                image: admissionData.photo || "",
                status: "Active"
            });
        }

        // 2. Generate secure single-use activation / password-setup token (24-hour expiry)
        const activationToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(activationToken).digest("hex");
        const tokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // 3. Create or prepare User authentication account
        let newUser;
        if (existingUser) {
            newUser = existingUser;
            newUser.status = "Active";
            newUser.resetPasswordToken = hashedToken;
            newUser.resetPasswordExpire = tokenExpire;
            await newUser.save();
        } else {
            newUser = await User.create({
                full_name: admissionData.studentName,
                email: cleanEmail,
                mobile_no: phoneDigits ? Number(phoneDigits) : undefined,
                course: admissionData.courseName,
                role: "student",
                status: "Active",
                password: null, // No plaintext passwords stored or sent
                resetPasswordToken: hashedToken,
                resetPasswordExpire: tokenExpire,
                studentId: null
            });
        }

        // 4. Link records reciprocally via accountLinker
        const linkResult = await linkStudentToUser({
            studentId: newStudent._id,
            userId: newUser._id
        });

        if (!linkResult.success) {
            // Rollback both created records to preserve consistency
            if (!existingStudent) {
                await Student.findByIdAndDelete(newStudent._id).catch(() => {});
            }
            if (!existingUser) {
                await User.findByIdAndDelete(newUser._id).catch(() => {});
            }
            return res.status(500).json({
                status: false,
                message: "Failed to link student profile and login account. Operation rolled back safely.",
                error: linkResult.message
            });
        }

        // 5. Update admission record
        admissionData.status = "approved";
        admissionData.studentId = newStudent._id;
        admissionData.userId = newUser._id;
        await admissionData.save();

        // 6. Send Account Activation & Password Setup Email
        const origin = req.get("origin") || req.get("referer");
        let clientUrl = process.env.FRONTEND_URL;
        if (!clientUrl && origin) {
            try {
                const parsed = new URL(origin);
                clientUrl = `${parsed.protocol}//${parsed.host}`;
            } catch (e) {
                clientUrl = "http://localhost:3000";
            }
        }
        if (!clientUrl) {
            clientUrl = "http://localhost:3000";
        }

        const activationUrl = `${clientUrl}/reset-password/${activationToken}`;
        const emailSubject = "SK College - Admission Approved & Account Activation";
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #2563eb; margin: 0 0 6px 0; font-size: 24px;">SK College Portal</h2>
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Admission Approved</p>
                </div>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">Dear <strong>${admissionData.studentName}</strong>,</p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Congratulations! Your admission application for <strong>${admissionData.courseName}</strong> has been <strong>approved</strong>.
                </p>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Your student portal account has been created. Please click the button below to set your initial password and activate your student portal access:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${activationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Set Up Password & Activate Account
                    </a>
                </div>
                <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">If the button does not work, copy and paste this link into your browser:</p>
                <p style="font-size: 12px; word-break: break-all; color: #2563eb; background-color: #f3f4f6; padding: 10px; border-radius: 6px;">${activationUrl}</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin: 0;">
                    * This activation link is valid for <strong>24 hours</strong>.<br />
                    * Please keep your login credentials secure.
                </p>
            </div>
        `;

        let emailSent = false;
        try {
            const mailInfo = await sendMail(cleanEmail, emailSubject, emailHtml);
            if (mailInfo && (mailInfo.messageId || (Array.isArray(mailInfo.accepted) && mailInfo.accepted.length > 0))) {
                emailSent = true;
                const masked = cleanEmail.replace(/(?<=.{2}).(?=.*@)/g, "*");
                console.log(`[SMTP SUCCESS] Admission activation email accepted by mail server for ${masked}. MessageId: ${mailInfo.messageId}`);
            }
        } catch (mailErr) {
            console.error(`[SMTP ERROR] Admission activation mail dispatch failed: Code: ${mailErr.code || "UNKNOWN"}, Message: ${mailErr.message}`);
            if (process.env.NODE_ENV !== "production") {
                console.log(`[DEV ONLY] Activation Setup Link for ${cleanEmail}: ${activationUrl}`);
            }
        }

        return res.status(200).json({
            status: true,
            message: "Admission approved successfully. Student profile and login account created and linked.",
            emailSent,
            data: {
                admissionId: admissionData._id,
                studentId: newStudent._id,
                userId: newUser._id,
                status: "approved"
            }
        });

    } catch (error) {
        console.error("Approve admission error:", error);
        return res.status(500).json({
            status: false,
            message: error.message || "Failed to approve admission"
        });
    }
};

// ================= REJECT ADMISSION =================
const rejectAdmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;

        const admissionData = await admission.findById(id);

        if (!admissionData) {
            return res.status(404).json({
                status: false,
                message: "Admission record not found"
            });
        }

        if (admissionData.status === "approved") {
            return res.status(400).json({
                status: false,
                message: "Cannot reject an application that has already been approved."
            });
        }

        admissionData.status = "rejected";
        admissionData.rejectionReason = rejectionReason || "Application not accepted by college administration.";
        await admissionData.save();

        // Optional notification email to applicant
        try {
            if (admissionData.email) {
                await sendMail(
                    admissionData.email,
                    "SK College - Admission Application Update",
                    `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                            <h2 style="color: #dc2626; margin-top: 0;">Admission Application Update</h2>
                            <p>Dear <strong>${admissionData.studentName}</strong>,</p>
                            <p>Thank you for your interest in SK College. After reviewing your application for <strong>${admissionData.courseName}</strong>, we regret to inform you that your application could not be approved at this time.</p>
                            <p><strong>Reason:</strong> ${admissionData.rejectionReason}</p>
                            <p>If you have any questions or require further assistance, please contact the admissions office.</p>
                        </div>
                    `
                );
            }
        } catch (mailErr) {
            console.error("Warning: Rejection email dispatch failed:", mailErr.message);
        }

        return res.status(200).json({
            status: true,
            message: "Admission application rejected.",
            data: admissionData
        });

    } catch (error) {
        console.error("Reject admission error:", error);
        return res.status(500).json({
            status: false,
            message: error.message || "Failed to reject admission"
        });
    }
};

// ================= UPDATE STATUS =================
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const admissionData = await admission.findById(id);

        if (!admissionData) {
            return res.status(404).json({
                status: false,
                message: "Admission not found",
            });
        }

        admissionData.status =
            admissionData.status === "Active" ? "Inactive" : "Active";

        await admissionData.save();

        res.status(200).json({
            status: true,
            message: "Admission status updated successfully",
            data: admissionData,
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error updating status",
            error: error.message,
        });
    }
};

// ================= DELETE ADMISSION =================
const deleteAdmission = async (req, res) => {
    try {
        const { id } = req.params;

        const admissionData = await admission.findByIdAndDelete(id);

        if (!admissionData) {
            return res.status(404).json({
                status: false,
                message: "Admission not found"
            });
        }

        res.status(200).json({
            status: true,
            message: "Admission deleted successfully",
            data: admissionData
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error deleting admission",
            error: error.message
        });
    }
};

module.exports = {
    addAdmission,
    findAdmission,
    findAllAdmission,
    updateAdmission,
    approveAdmission,
    rejectAdmission,
    updateStatus,
    deleteAdmission
};

const User = require("../../model/fronted/register");
const Student = require("../../model/admin/student");
const crypto = require("crypto");

const { comparePassword, hashPassword } = require("../../utils/byrypt");
const { generateToken } = require("../../utils/jwt");
const sendMail = require("../../utils/sendMail");

const generatePassword = () => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";

    let password = "";

    for (let i = 0; i < 10; i++) {
        password += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return password;
};

// ================= REGISTER =================

const register = async (req, res) => {
    try {
        const {
            email,
            mobile_no,
            full_name,
            course
        } = req.body;

        const cleanEmail = email ? email.toLowerCase().trim() : "";

        // Check existing user
        const existingUser = await User.findOne({ email: cleanEmail });

        if (existingUser) {
            return res.status(409).json({
                status: false,
                message: "Email is already registered."
            });
        }

        // Generate random password
        const password = generatePassword();

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user (studentId remains null; linking requires explicit Admin/HOD authorization)
        const newUser = await User.create({
            ...req.body,
            email: cleanEmail,
            role: "student",
            password: hashedPassword,
            studentId: null
        });

        // Send password on email (catch SMTP errors gracefully so registration is not aborted if mail server fails)
        try {
            await sendMail(
                email,
                "Registration Successful",
                `
                    <h2>Registration Successful</h2>

                    <p>Hello ${full_name},</p>

                    <p>Your account has been created successfully.</p>

                    <p><strong>Email:</strong> ${email}</p>

                    <p><strong>Password:</strong> ${password}</p>

                    <p>Please keep your password safe.</p>
                `
            );
        } catch (mailErr) {
            console.error("[SMTP ERROR] Registration mail dispatch failed:", mailErr.code, mailErr.message);
        }

        return res.status(201).json({
            status: true,
            message: "Registration completed successfully. Password sent to your email.",
            isLinkedToStudentProfile: false
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: false,
            message: "Something went wrong. Please try again."
        });
    }
};

// ================= LOGIN =================

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const cleanEmail = email ? email.toLowerCase().trim() : "";

        // Find user
        const docheck = await User.findOne({ email: cleanEmail });

        if (!docheck) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        if (docheck.status === "Inactive") {
            return res.status(403).json({
                status: false,
                message: "Your account is inactive. Please contact the college administration."
            });
        }

        if (!docheck.password) {
            return res.status(401).json({
                status: false,
                message: "Password has not been set for this account yet. Please check your email for the activation link or use Forgot Password to set your password."
            });
        }

        // Compare password
        const isPasswordCorrect = await comparePassword(
            password,
            docheck.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: false,
                message: "Password invalid"
            });
        }

        // Resolve and verify linked student profile via reciprocal database check
        let studentRecord = null;
        let verifiedStudentId = null;
        if (docheck.studentId) {
            const potentialStudent = await Student.findById(docheck.studentId);
            // Verify that the student record reciprocally points back to this exact user account
            if (potentialStudent && String(potentialStudent.userId) === String(docheck._id)) {
                if (potentialStudent.status === "Inactive") {
                    return res.status(403).json({
                        status: false,
                        message: "Your student enrollment is currently inactive. Please contact the college administration."
                    });
                }
                studentRecord = potentialStudent;
                verifiedStudentId = potentialStudent._id;
            } else {
                // Link is broken, missing, or pointing to another account; do not trust
                verifiedStudentId = null;
                studentRecord = null;
            }
        }

        // JWT payload
        const role = String(docheck.role || "student").toLowerCase();
        const payload = {
            id: docheck._id,
            mobile_no: docheck.mobile_no,
            email: docheck.email,
            role: role,
            name: docheck.full_name,
            studentId: verifiedStudentId
        };

        // Generate token
        const token = await generateToken(payload);

        return res.status(200).json({
            status: true,
            message: "Login Successful",
            token,
            user: {
                id: docheck._id,
                email: docheck.email,
                name: docheck.full_name,
                role: role,
                studentId: verifiedStudentId,
                studentProfile: studentRecord
                    ? {
                        id: studentRecord._id,
                        studentName: studentRecord.StudentName,
                        course: studentRecord.Course,
                        status: studentRecord.status
                    }
                    : null
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// ================= FORGOT PASSWORD =================

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: false,
                message: "Email is required"
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        // Find user by registered student email
        let user = await User.findOne({ email: cleanEmail });

        // If login account does not exist, check if an active academic student profile exists
        if (!user) {
            const studentRec = await Student.findOne({ email: cleanEmail });
            if (studentRec && studentRec.status === "Active") {
                user = await User.create({
                    full_name: studentRec.StudentName,
                    email: cleanEmail,
                    mobile_no: studentRec.Phonenumber,
                    course: studentRec.Course,
                    role: "student",
                    status: "Active",
                    password: null,
                    studentId: studentRec._id
                });
                studentRec.userId = user._id;
                await studentRec.save();
            }
        }

        if (user) {
            // Check if user account or student profile is Inactive
            let isEligible = true;
            if (user.status === "Inactive") {
                isEligible = false;
            }
            if (user.studentId) {
                const studentRec = await Student.findById(user.studentId);
                if (studentRec && studentRec.status === "Inactive") {
                    isEligible = false;
                }
            }

            if (isEligible) {
                // Generate cryptographically secure random token (32 bytes = 64 hex characters)
                const resetToken = crypto.randomBytes(32).toString("hex");

                // Hash the token with SHA-256 before saving to database
                const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

                // Token expiry set to 15 minutes
                user.resetPasswordToken = hashedToken;
                user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

                await user.save();

                // Construct password reset URL for frontend
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
                const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

                const emailSubject = "SK College - Password Reset Request";
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h2 style="color: #2563eb; margin: 0 0 6px 0; font-size: 24px;">SK College Portal</h2>
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">Student Account Security</p>
                        </div>
                        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hello <strong>${user.full_name || "Student"}</strong>,</p>
                        <p style="color: #374151; font-size: 15px; line-height: 1.6;">We received a request to reset the password for your SK College student account. Click the button below to choose a new password:</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">If the button does not work, copy and paste this link into your browser:</p>
                        <p style="font-size: 12px; word-break: break-all; color: #2563eb; background-color: #f3f4f6; padding: 10px; border-radius: 6px;">${resetUrl}</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin: 0;">
                            * This link is single-use and will expire in <strong>15 minutes</strong>.<br />
                            * If you did not request a password reset, you can safely ignore this email. Your account password remains unchanged.
                        </p>
                    </div>
                `;

                // Mask email for privacy in backend logs
                const maskedEmail = cleanEmail.replace(/(?<=.{2}).(?=.*@)/g, "*");

                try {
                    const mailInfo = await sendMail(user.email, emailSubject, emailHtml);

                    if (mailInfo && Array.isArray(mailInfo.accepted) && mailInfo.accepted.length > 0) {
                        console.log(`[SMTP SUCCESS] Password reset email accepted by mail server for ${maskedEmail}. MessageId: ${mailInfo.messageId}`);
                    } else if (mailInfo && mailInfo.messageId) {
                        console.log(`[SMTP SUCCESS] Password reset email queued for ${maskedEmail}. MessageId: ${mailInfo.messageId}`);
                    } else {
                        throw new Error("Mail server did not confirm message acceptance.");
                    }

                    return res.status(200).json({
                        status: true,
                        message: "If an account with that email exists, a password reset link has been sent."
                    });

                } catch (mailErr) {
                    console.error(`[SMTP ERROR] Failed to deliver password reset email to ${maskedEmail}. Code: ${mailErr.code || "UNKNOWN"}, Message: ${mailErr.message}`);

                    // Strictly disable development reset link logging in production
                    if (process.env.NODE_ENV !== "production") {
                        console.log(`[DEV ONLY] Reset Link for ${maskedEmail}: ${resetUrl}`);
                    }

                    // Invalidate un-delivered token in DB so orphaned tokens are not left active
                    user.resetPasswordToken = null;
                    user.resetPasswordExpire = null;
                    await user.save().catch(() => {});

                    return res.status(503).json({
                        status: false,
                        message: "Unable to deliver password reset email at this time due to a mail service error. Please contact college administration or try again later."
                    });
                }
            } else {
                console.log(`[INFO] Password reset skipped for inactive account/student: ${user.email}`);
            }
        }

        // Always return generic success response without revealing registration status (Anti-Enumeration)
        return res.status(200).json({
            status: true,
            message: "If an account with that email exists, a password reset link has been sent."
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong. Please try again."
        });
    }
};

// ================= VERIFY RESET TOKEN =================

const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                status: false,
                message: "Reset token is required"
            });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: false,
                message: "Password reset link is invalid or has expired."
            });
        }

        if (user.status === "Inactive") {
            return res.status(403).json({
                status: false,
                message: "This account is inactive. Please contact administration."
            });
        }

        return res.status(200).json({
            status: true,
            message: "Reset token is valid."
        });

    } catch (error) {
        console.error("Verify reset token error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error"
        });
    }
};

// ================= RESET PASSWORD =================

const resetPassword = async (req, res) => {
    try {
        const token = req.params.token || req.body.token;
        const { password, confirmPassword } = req.body;

        if (!token) {
            return res.status(400).json({
                status: false,
                message: "Reset token is missing"
            });
        }

        if (!password) {
            return res.status(400).json({
                status: false,
                message: "New password is required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                status: false,
                message: "Password must be at least 6 characters long"
            });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({
                status: false,
                message: "Passwords do not match"
            });
        }

        // Hash token to query database
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: false,
                message: "Password reset link is invalid, expired, or has already been used."
            });
        }

        if (user.status === "Inactive") {
            return res.status(403).json({
                status: false,
                message: "This account is inactive. Please contact administration."
            });
        }

        // Hash new password using existing project hashPassword function
        const hashedPassword = await hashPassword(password);

        // Update password and invalidate single-use token immediately
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        user.passwordChangedAt = new Date();

        await user.save();

        return res.status(200).json({
            status: true,
            message: "Password reset successfully. Please log in with your new password."
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error"
        });
    }
};

// ================= EXPORT =================

module.exports = {
    register,
    login,
    forgotPassword,
    verifyResetToken,
    resetPassword
};
const admission = require("../../model/admin/admission");
const User = require("../../model/fronted/register");
const Student = require("../../model/admin/student");
const { sendAdminAdmissionNotification } = require("../../utils/admissionNotification");

// ================= PUBLIC APPLY NOW / INQUIRY =================
const applyAdmission = async (req, res) => {
    try {
        const {
            full_name,
            studentName,
            email,
            mobile_no,
            mobile,
            course,
            courseName,
            fatherName,
            motherName,
            parentMobile,
            guardianMobile,
            parent_mobile,
            gender,
            address,
            city,
            state,
            pincode,
            pin_code,
            pin,
            DOB,
            dob,
            qualification,
            board,
            passingYear,
            passing_year,
            percentage,
            session
        } = req.body;

        const name = (studentName || full_name || "").trim();
        const contactEmail = (email || "").toLowerCase().trim();
        const phone = (mobile || mobile_no || "").toString().trim();
        const selectedCourse = (courseName || course || "").trim();
        const father = (fatherName || "").trim();
        const mother = (motherName || "").trim();
        const pMobile = (parentMobile || guardianMobile || parent_mobile || "").toString().trim();
        const selectedGender = (gender || "").trim();
        const birthDate = DOB || dob || undefined;
        const qual = (qualification || "").trim();
        const boardUniv = (board || "").trim();
        const passYr = passingYear || passing_year;
        const pct = (percentage !== undefined && percentage !== null) ? String(percentage).trim() : "";
        const acadSession = (session || "2026-27").trim();
        const fullAddr = (address || "").trim();
        const cityName = (city || "").trim();
        const stateName = (state || "").trim();
        const pinCode = (pincode || pin_code || pin || "").toString().trim();

        // 1. Files
        const photo = req.files?.photo?.[0]?.filename || req.body?.photo || "";
        const signature = req.files?.signature?.[0]?.filename || req.body?.signature || "";
        const marksheet = req.files?.marksheet?.[0]?.filename || req.body?.marksheet || "";

        // 2. Validate Personal Details
        if (!name) {
            return res.status(400).json({
                status: false,
                message: "Full Name is required."
            });
        }

        if (!contactEmail) {
            return res.status(400).json({
                status: false,
                message: "Email address is required."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactEmail)) {
            return res.status(400).json({
                status: false,
                message: "Please provide a valid email address."
            });
        }

        if (!phone) {
            return res.status(400).json({
                status: false,
                message: "Mobile number is required."
            });
        }

        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length !== 10) {
            return res.status(400).json({
                status: false,
                message: "Please provide a valid 10-digit mobile number."
            });
        }

        if (pMobile) {
            const cleanPMobile = pMobile.replace(/\D/g, "");
            if (cleanPMobile.length !== 10) {
                return res.status(400).json({
                    status: false,
                    message: "Parent/Guardian mobile number must be exactly 10 digits."
                });
            }
        }

        // 3. Validate Academic Details
        if (!selectedCourse) {
            return res.status(400).json({
                status: false,
                message: "Please select an applying course."
            });
        }

        if (pct) {
            const numericPct = parseFloat(pct);
            if (isNaN(numericPct) || numericPct < 0 || numericPct > 100) {
                return res.status(400).json({
                    status: false,
                    message: "Qualification percentage must be between 0 and 100."
                });
            }
        }

        if (pinCode) {
            const cleanPin = pinCode.replace(/\D/g, "");
            if (cleanPin.length !== 6) {
                return res.status(400).json({
                    status: false,
                    message: "PIN code must be a valid 6-digit postal code."
                });
            }
        }

        // 4. Prevent duplicate inquiries and conflicts with existing registered students
        const existingPending = await admission.findOne({
            email: contactEmail,
            status: "Pending"
        });

        if (existingPending) {
            return res.status(409).json({
                status: false,
                message: "An admission application with this email is already submitted and pending review."
            });
        }

        const existingApproved = await admission.findOne({
            email: contactEmail,
            status: "approved"
        });

        if (existingApproved) {
            return res.status(409).json({
                status: false,
                message: "An approved admission already exists for this email. Please check your email or log in."
            });
        }

        const existingUser = await User.findOne({ email: contactEmail });
        if (existingUser) {
            return res.status(409).json({
                status: false,
                message: "A student account with this email is already registered. Please log in directly."
            });
        }

        // 5. Save application in admissions collection
        const newAdmission = await admission.create({
            studentName: name,
            email: contactEmail,
            mobile: cleanPhone,
            courseName: selectedCourse,
            fatherName: father,
            motherName: mother,
            parentMobile: pMobile ? pMobile.replace(/\D/g, "") : "",
            gender: selectedGender,
            DOB: birthDate ? new Date(birthDate) : undefined,
            qualification: qual,
            board: boardUniv,
            passingYear: passYr ? Number(passYr) : undefined,
            percentage: pct,
            session: acadSession,
            address: fullAddr,
            city: cityName,
            state: stateName,
            pincode: pinCode,
            photo,
            signature,
            marksheet,
            status: "Pending",
            admissionDate: new Date(),
            studentId: null,
            userId: null,
            adminNotificationSent: false
        });

        // 6. Send professional email notification to college admin email
        // Email failure must NOT delete or invalidate an already saved application.
        // Prevent duplicate notifications.
        try {
            if (!newAdmission.adminNotificationSent) {
                const notifResult = await sendAdminAdmissionNotification(newAdmission, req);
                if (notifResult?.success) {
                    newAdmission.adminNotificationSent = true;
                    newAdmission.adminNotificationSentAt = new Date();
                    await newAdmission.save();
                }
            }
        } catch (emailErr) {
            // Log error securely without leaking credentials or sensitive data
            console.error(`[ADMIN NOTIFICATION ERROR] Email delivery failed for application ID ${newAdmission._id}: Code: ${emailErr.code || "UNKNOWN"}, Message: ${emailErr.message}`);
        }

        return res.status(201).json({
            status: true,
            message: "Your admission application has been submitted successfully and is under review.",
            data: newAdmission
        });

    } catch (error) {
        console.error("Apply admission error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to submit admission application. Please try again.",
            error: error.message
        });
    }
};

// GET ALL
const getAdmissions = async (req, res) => {
    try {
        const admissionData = await admission.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            status: true,
            data: admissionData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: false,
            message: error.message,
        });
    }
};

// GET BY ID
const getAdmissionById = async (req, res) => {
    try {
        const { id } = req.params;

        const admissionData = await admission.findById(id);

        if (!admissionData) {
            return res.status(404).json({
                success: false,
                status: false,
                message: "Admission not found",
            });
        }

        res.json({
            success: true,
            status: true,
            data: admissionData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    applyAdmission,
    getAdmissions,
    getAdmissionById,
};

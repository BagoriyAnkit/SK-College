const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const sendMail = require("./sendMail");

/**
 * Builds an SK College branded HTML email template for new admission applications.
 */
const buildAdminAdmissionEmailTemplate = (admission, clientUrl, formattedDate) => {
    const adminReviewUrl = `${clientUrl}/admin/addmissions`;

    const studentName = admission.studentName || "Applicant";
    const appId = String(admission._id || "N/A");
    const email = admission.email || "N/A";
    const mobile = admission.mobile || "N/A";
    const courseName = admission.courseName || "N/A";
    const session = admission.session || "2026-27";

    const fatherName = admission.fatherName || "Not Provided";
    const motherName = admission.motherName || "Not Provided";
    const parentMobile = admission.parentMobile ? `+91 ${admission.parentMobile}` : "Not Provided";

    const qualification = admission.qualification || "Not Specified";
    const board = admission.board || "Not Specified";
    const passingYear = admission.passingYear ? String(admission.passingYear) : "Not Specified";
    const percentage = admission.percentage ? `${admission.percentage}%` : "Not Specified";

    const residentialAddress = admission.address || "Not Provided";
    const cityStatePin = [
        admission.city,
        admission.state,
        admission.pincode ? `PIN: ${admission.pincode}` : ""
    ].filter(Boolean).join(", ") || "Not Provided";

    const hasPhoto = Boolean(admission.photo);
    const hasSignature = Boolean(admission.signature);
    const hasMarksheet = Boolean(admission.marksheet);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Admission Application Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 30px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #0f172a; padding: 28px 32px; text-align: left; border-bottom: 3px solid #d97706;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <div style="display: inline-block; padding: 4px 10px; background-color: rgba(217, 119, 6, 0.2); border: 1px solid rgba(217, 119, 6, 0.4); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                                            Admissions Office &bull; College Code: SKC-104
                                        </div>
                                        <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">
                                            SK College of Technology
                                        </h1>
                                        <p style="margin: 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
                                            New Online Admission Application Alert
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Alert Notice Banner -->
                    <tr>
                        <td style="padding: 24px 32px 12px 32px;">
                            <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 16px; border-radius: 8px;">
                                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1e40af; font-weight: 500;">
                                    A prospective candidate has submitted a new online admission application through the college public portal. Please review the applicant credentials and schedule eligibility verification.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Summary Card Header -->
                    <tr>
                        <td style="padding: 12px 32px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px;">
                                <tr>
                                    <td width="60%" style="vertical-align: top;">
                                        <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">Applicant Name</span>
                                        <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                                            ${studentName}
                                        </div>
                                        <div style="font-size: 12px; color: #475569; margin-top: 4px;">
                                            Applied For: <strong style="color: #0f172a;">${courseName}</strong>
                                        </div>
                                    </td>
                                    <td width="40%" style="vertical-align: top; text-align: right;">
                                        <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">Application ID</span>
                                        <div style="font-family: monospace; font-size: 12px; font-weight: 700; color: #0f172a; background-color: #ffffff; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 6px; display: inline-block; margin-top: 4px;">
                                            ${appId}
                                        </div>
                                        <div style="font-size: 11px; color: #b45309; font-weight: 700; margin-top: 6px;">
                                            &bull; Status: Pending Review
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- 1. Applicant Details -->
                    <tr>
                        <td style="padding: 12px 32px 6px 32px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                                1. Applicant Contact &amp; Identity
                            </h3>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
                                <tr>
                                    <td width="50%" style="padding: 4px 0; color: #64748b; vertical-align: top;">Email Address:</td>
                                    <td width="50%" style="padding: 4px 0; color: #0f172a; font-weight: 600; text-align: right; word-break: break-all;">${email}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="padding: 4px 0; color: #64748b; vertical-align: top;">Mobile Number:</td>
                                    <td width="50%" style="padding: 4px 0; color: #0f172a; font-weight: 600; font-family: monospace; text-align: right;">+91 ${mobile}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="padding: 4px 0; color: #64748b; vertical-align: top;">Gender / DOB:</td>
                                    <td width="50%" style="padding: 4px 0; color: #0f172a; font-weight: 600; text-align: right;">
                                        ${admission.gender || "N/A"}${admission.DOB ? ` &bull; ${new Date(admission.DOB).toLocaleDateString("en-IN")}` : ""}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- 2. Academic Program Details -->
                    <tr>
                        <td style="padding: 12px 32px 6px 32px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                                2. Academic Program &amp; Qualification
                            </h3>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
                                <tr>
                                    <td width="50%" style="padding: 4px 0; color: #64748b;">Applying Course:</td>
                                    <td width="50%" style="padding: 4px 0; color: #0f172a; font-weight: 700; text-align: right;">${courseName}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="padding: 4px 0; color: #64748b;">Academic Session:</td>
                                    <td width="50%" style="padding: 4px 0; color: #0f172a; font-weight: 600; text-align: right;">${session}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="padding: 4px 0; color: #64748b;">Prior Qualification:</td>
                                    <td width="50%" style="padding: 4px 0; color: #0f172a; font-weight: 600; text-align: right;">${qualification}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="padding: 4px 0; color: #64748b;">Board / University:</td>
                                    <td width="50%" style="padding: 4px 0; color: #0f172a; font-weight: 600; text-align: right;">${board}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="padding: 4px 0; color: #64748b;">Passing Year &amp; Marks (%):</td>
                                    <td width="50%" style="padding: 4px 0; color: #0f172a; font-weight: 700; text-align: right;">
                                        ${passingYear} &bull; <span style="color: #047857;">${percentage}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- 3. Parent / Guardian Details -->
                    <tr>
                        <td style="padding: 12px 32px 6px 32px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                                3. Parent / Guardian Details
                            </h3>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
                                <tr>
                                    <td width="50%" style="padding: 4px 0; color: #64748b;">Father's Name:</td>
                                    <td width="50%" style="padding: 4px 0; color: #0f172a; font-weight: 600; text-align: right;">${fatherName}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="padding: 4px 0; color: #64748b;">Mother's Name:</td>
                                    <td width="50%" style="padding: 4px 0; color: #0f172a; font-weight: 600; text-align: right;">${motherName}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="padding: 4px 0; color: #64748b;">Parent Contact Number:</td>
                                    <td width="50%" style="padding: 4px 0; color: #0f172a; font-weight: 600; font-family: monospace; text-align: right;">${parentMobile}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- 4. Location & Uploads -->
                    <tr>
                        <td style="padding: 12px 32px 16px 32px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                                4. Residential Address &amp; Uploaded Documents
                            </h3>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
                                <tr>
                                    <td width="35%" style="padding: 4px 0; color: #64748b; vertical-align: top;">Residential Address:</td>
                                    <td width="65%" style="padding: 4px 0; color: #0f172a; font-weight: 500; text-align: right;">${residentialAddress}</td>
                                </tr>
                                <tr>
                                    <td width="35%" style="padding: 4px 0; color: #64748b; vertical-align: top;">City, State, PIN:</td>
                                    <td width="65%" style="padding: 4px 0; color: #0f172a; font-weight: 600; text-align: right;">${cityStatePin}</td>
                                </tr>
                                <tr>
                                    <td width="35%" style="padding: 4px 0; color: #64748b; vertical-align: top;">Document Proofs:</td>
                                    <td width="65%" style="padding: 4px 0; text-align: right; font-size: 12px;">
                                        <span style="color: ${hasPhoto ? '#047857' : '#94a3b8'}; font-weight: 600;">[${hasPhoto ? '✓' : '✗'} Photo]</span> &nbsp;
                                        <span style="color: ${hasSignature ? '#047857' : '#94a3b8'}; font-weight: 600;">[${hasSignature ? '✓' : '✗'} Signature]</span> &nbsp;
                                        <span style="color: ${hasMarksheet ? '#047857' : '#94a3b8'}; font-weight: 600;">[${hasMarksheet ? '✓' : '✗'} Marksheet]</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="35%" style="padding: 4px 0; color: #64748b; vertical-align: top;">Submission Date:</td>
                                    <td width="65%" style="padding: 4px 0; color: #0f172a; font-weight: 700; text-align: right;">${formattedDate}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Call-to-Action Button -->
                    <tr>
                        <td style="padding: 16px 32px 32px 32px; text-align: center;">
                            <a href="${adminReviewUrl}" target="_blank" style="display: inline-block; padding: 13px 32px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 10px; box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);">
                                Open Admin Panel &rarr;
                            </a>
                            <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8;">
                                Log in as Administrator or HOD to inspect documents and issue approval.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
                            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #475569;">
                                SK College of Technology &bull; Admissions &amp; Enrollment Cell
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                                This is an automated notification sent when a new application is submitted on the public website.<br/>
                                Please do not reply directly to this automated email.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

/**
 * Sends a professional HTML admission notification to the college admin email.
 * Ensures:
 * - Credentials and secrets are not leaked
 * - Email errors are caught safely and do not fail or roll back the saved application
 * - Duplicate notifications are prevented
 */
const sendAdminAdmissionNotification = async (admission, req) => {
    // 1. Resolve Admin Recipient Email from environment variables securely
    const adminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL || "").trim();

    if (!adminEmail) {
        console.warn("[ADMIN NOTIFICATION] No admin recipient email configured in ADMIN_EMAIL or EMAIL. Skipping notification.");
        return { success: false, reason: "NO_ADMIN_EMAIL" };
    }

    // 2. Resolve Client / Frontend Base URL
    const origin = req?.get ? (req.get("origin") || req.get("referer")) : null;
    let clientUrl = process.env.FRONTEND_URL;
    if (!clientUrl && origin) {
        try {
            const parsed = new URL(origin);
            clientUrl = `${parsed.protocol}//${parsed.host}`;
        } catch (_) {
            clientUrl = "http://localhost:3000";
        }
    }
    if (!clientUrl) {
        clientUrl = "http://localhost:3000";
    }

    // 3. Format Submission Date & Time in IST
    const submissionDate = admission.createdAt || admission.admissionDate || new Date();
    const formattedDate = new Date(submissionDate).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    }) + " IST";

    // 4. Construct Subject & HTML Body
    const subject = `SK College - New Admission Application: ${admission.studentName} (${admission.courseName || "General"})`;
    const html = buildAdminAdmissionEmailTemplate(admission, clientUrl, formattedDate);

    // 5. Send Email via reusable sendMail service
    const mailInfo = await sendMail(adminEmail, subject, html);

    // Mask admin email for secure logging (never log full personal email or credentials)
    const maskedAdminEmail = adminEmail.replace(/(?<=.{2}).(?=.*@)/g, "*");
    console.log(`[ADMIN NOTIFICATION SUCCESS] Notification email sent to admin (${maskedAdminEmail}) for application ID: ${admission._id}. MessageId: ${mailInfo?.messageId}`);

    return {
        success: true,
        messageId: mailInfo?.messageId
    };
};

module.exports = {
    sendAdminAdmissionNotification,
    buildAdminAdmissionEmailTemplate
};

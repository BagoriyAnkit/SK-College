const nodemailer = require("nodemailer");
const dns = require("dns");
const path = require("path");

// Ensure IPv4 lookup precedence to avoid IPv6 resolution issues with Google SMTP on Windows
dns.setDefaultResultOrder("ipv4first");

// Ensure environment variables are loaded
require("dotenv").config({ path: path.join(__dirname, "../.env") });

/**
 * Builds and returns a configured Nodemailer transporter using environment variables.
 * Supports EMAIL, EMAIL_PASS, EMAIL_PASSWORD, SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS.
 */
const getTransporter = () => {
    // Always load latest environment variables from .env with override: true
    require("dotenv").config({ path: path.join(__dirname, "../.env"), override: true });

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    const user = (process.env.EMAIL || process.env.SMTP_USER || "").trim();
    const pass = (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || "").trim();

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Runs SMTP connection and credential verification without sending an email.
 * Never prints or leaks credentials.
 */
const verifySmtpConnection = async () => {
    try {
        const transporter = getTransporter();
        await transporter.verify();
        return {
            success: true,
            message: "SMTP server verified credentials and accepted connection."
        };
    } catch (error) {
        return {
            success: false,
            code: error.code || "UNKNOWN",
            responseCode: error.responseCode || null,
            command: error.command || null,
            message: error.message
        };
    }
};

/**
 * Sends an email using the configured transporter.
 * Returns the Nodemailer sendMail info object upon success.
 * Throws an error upon failure so callers can handle delivery issues explicitly.
 */
const sendMail = async (to, subject, html) => {
    const user = (process.env.EMAIL || process.env.SMTP_USER || "").trim();
    const transporter = getTransporter();

    const fromAddress = user ? `"SK College" <${user}>` : "SK College Portal";

    const info = await transporter.sendMail({
        from: fromAddress,
        to: to,
        subject: subject,
        html: html
    });

    return info;
};

module.exports = sendMail;
module.exports.sendMail = sendMail;
module.exports.getTransporter = getTransporter;
module.exports.verifySmtpConnection = verifySmtpConnection;

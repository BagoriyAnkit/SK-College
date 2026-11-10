const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const cors = require("cors");

const dbAsync = require("./config/db");
const router = require("./router/AdminRouter/indexAdmin");
const frontedrouter = require("./router/frontedRouter/index");
const validate = require("./middleware/validate");
const { loginValidation, registerValidation } = require("./validation/frontedValidation/registerValidation");
const registercontroller = require("./controller/Fronted/registercontroller");

dbAsync();

app.use(cors());
app.use(express.json());

const Admin = require("./model/admin/user");
const userController = require("./controller/Admin/userController");

// GET / Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    message: "SK College Management Backend is running successfully",
    port: port,
    uptime: process.uptime()
  });
});

// Dedicated Admin Login route
app.post("/admin/login", userController.adminLogin);

// Root authentication routes (handles both admin and student seamlessly)
app.post("/login", async (req, res, next) => {
  try {
    const email = req.body?.email;
    if (email) {
      const adminExists = await Admin.findOne({ email: email.toLowerCase().trim() });
      if (adminExists) {
        return userController.adminLogin(req, res, next);
      }
    }
  } catch (err) {}
  return validate(loginValidation)(req, res, () => registercontroller.login(req, res, next));
});
app.post("/register", validate(registerValidation), registercontroller.register);

// Root forgot/reset password endpoints
app.post("/forgot-password", registercontroller.forgotPassword);
app.post("/reset-password/:token", registercontroller.resetPassword);
app.post("/reset-password", registercontroller.resetPassword);
app.get("/verify-reset-token/:token", registercontroller.verifyResetToken);

// Public admission inquiry routes
const admissionFrontController = require("./controller/Fronted/admissionController");
const uploadMiddleware = require("./middleware/upload");
const admissionUploadFields = uploadMiddleware.fields([
  { name: "photo", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "marksheet", maxCount: 1 }
]);
app.post("/admission/apply", admissionUploadFields, admissionFrontController.applyAdmission);
app.post("/apply", admissionUploadFields, admissionFrontController.applyAdmission);

// Public frontend routers
app.use("/frontend", frontedrouter);

// Static uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Admin routers
app.use(router);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    status: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  // Handle Multer file upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: "File size exceeds the 5MB limit. Please upload a smaller file."
    });
  }

  if (err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: err.message || "Invalid file type. Only JPG, PNG, and PDF files are allowed."
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: `File upload error: ${err.message}`
    });
  }

  // Handle malformed JSON request bodies
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      message: "Malformed JSON payload provided."
    });
  }

  console.error("[SERVER ERROR]", err);

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    status: false,
    statusCode: statusCode,
    message: err.message || "Internal Server Error"
  });
});

const { verifySmtpConnection } = require("./utils/sendMail");

app.listen(port, () => {
  console.log("Server running on port", port);
  verifySmtpConnection().then((res) => {
    if (res.success) {
      console.log("[SMTP STATUS] Mail server connection verified successfully.");
    } else {
      console.warn(`[SMTP WARNING] Mail server verification failed (${res.code}): ${res.message}`);
    }
  }).catch(() => {});
});

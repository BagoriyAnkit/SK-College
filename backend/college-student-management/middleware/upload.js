const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const fileName = path
      .basename(file.originalname, ext)
      .trim()
      .replace(/\s+/g, "-")        // spaces -> -
      .replace(/[^\w\-]/g, "");    // remove special characters

    cb(null, `${Date.now()}-${fileName || "file"}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /^\.(jpg|jpeg|png|pdf)$/i;
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/pjpeg",
    "image/png",
    "image/x-png",
    "application/pdf",
    "application/x-pdf"
  ];

  const ext = path.extname(file.originalname || "").toLowerCase();
  const mime = (file.mimetype || "").toLowerCase();

  const isExtAllowed = allowedExtensions.test(ext);
  const isMimeAllowed = allowedMimeTypes.includes(mime);

  if (isExtAllowed && isMimeAllowed) {
    return cb(null, true);
  }

  const err = new Error("Invalid file type. Only JPG, PNG, and PDF files are allowed.");
  err.code = "INVALID_FILE_TYPE";
  return cb(err, false);
};

// 5MB max file size limit
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
});

module.exports = upload;
module.exports.upload = upload;
module.exports.MAX_FILE_SIZE = MAX_FILE_SIZE;

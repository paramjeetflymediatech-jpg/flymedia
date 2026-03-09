const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Storage configuration
const folderPath = path.join(__dirname, "..", "public", "uploads");

// Ensure directory exists
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let role = "public";
    if (req.user && req.user.role) {
      role = req.user.role + req.user._id;
    }

    let type = "others";
    if (file.mimetype.startsWith("image/")) {
      type = "images";
    } else if (file.mimetype.startsWith("video/")) {
      type = "videos";
    } else if (file.mimetype.startsWith("audio/")) {
      type = "audio";
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed" ||
      file.mimetype === "application/x-rar-compressed" ||
      file.mimetype.includes("word") ||
      file.mimetype.includes("document")
    ) {
      type = "documents";
    }

    const uploadPath = path.join(folderPath, role, type);

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// File filter (optional security)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|pdf|.txt|doc|docx|mp4|webm|ogg|mp3|wav|mpeg|zip|rar|7z/;
  const isAllowedExt = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const isAllowedMime = file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("audio/") ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/zip" ||
    file.mimetype === "application/x-zip-compressed" ||
    file.mimetype === "application/x-rar-compressed" ||
    file.mimetype.includes("word") ||
    file.mimetype.includes("document");

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported. Please upload images, documents (including ZIP), videos, or audio files."));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter,
});

module.exports = upload;

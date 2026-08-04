const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloudinary Storage Engine Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isAudio = file.mimetype.startsWith("audio");

    return {
      folder: isAudio ? "vibeify_uploads/songs" : "vibeify_uploads/images",
      resource_type: isAudio ? "video" : "image", // Cloudinary treats audio as 'video' resource_type
      allowed_formats: isAudio
        ? ["mp3", "wav", "ogg", "m4a"]
        : ["jpg", "png", "jpeg", "webp"],
    };
  },
});

// File Validation Middleware
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "audio" && !file.mimetype.startsWith("audio/")) {
    return cb(new Error("Audio field must be a valid audio file"), false);
  }
  if (file.fieldname === "image" && !file.mimetype.startsWith("image/")) {
    return cb(new Error("Image field must be a valid image file"), false);
  }
  cb(null, true);
};

// Multer Middleware with 25MB Size Limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB Max file size limit
  },
});

module.exports = upload;
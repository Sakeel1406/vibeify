const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloudinary Storage Engine Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Rely on fieldname ("audio" vs "image") instead of unreliable client mimetype
    const isAudioField = file.fieldname === "audio";

    return {
      folder: isAudioField ? "vibeify_uploads/songs" : "vibeify_uploads/images",
      resource_type: isAudioField ? "video" : "image", // Cloudinary treats audio as 'video' resource_type
      allowed_formats: isAudioField
        ? ["mp3", "wav", "ogg", "m4a", "mp4"]
        : ["jpg", "png", "jpeg", "webp"],
    };
  },
});

// File Validation Middleware
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "audio") {
    // Allow standard audio MIME types and video/mp4 containers for audio tracks
    if (file.mimetype.startsWith("audio/") || file.mimetype.includes("mpeg") || file.mimetype.includes("mp4")) {
      return cb(null, true);
    }
    return cb(new Error("Audio field must be a valid audio file (MP3/WAV)"), false);
  }

  if (file.fieldname === "image") {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Image field must be a valid image file (JPG/PNG)"), false);
  }

  cb(null, true);
};

// Multer Middleware with 50MB Size Limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB Max file size limit
  },
});

module.exports = upload;
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "audio") {
      cb(null, path.join(__dirname, "..", "uploads", "songs"));
    } else if (file.fieldname === "image") {
      cb(null, path.join(__dirname, "..", "uploads", "images"));
    } else {
      cb(null, path.join(__dirname, "..", "uploads"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "audio" && !file.mimetype.startsWith("audio/")) {
    return cb(new Error("Audio field must be an audio file"));
  }
  if (file.fieldname === "image" && !file.mimetype.startsWith("image/")) {
    return cb(new Error("Image field must be an image file"));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024 } });

module.exports = upload;

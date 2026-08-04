const express = require("express");
const router = express.Router();
const {
  getSongs,
  getSongById,
  createSong,
  deleteSong,
  toggleLikeSong,
  getLikedSongs,
  recordPlay,
  getRecentlyPlayed,
} = require("../controllers/songController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// 1. Specific Static GET Routes (Must come BEFORE dynamic /:id route)
router.get("/", getSongs);
router.get("/liked/me", protect, getLikedSongs);
router.get("/recent/me", protect, getRecentlyPlayed);

// 2. Dynamic GET Route
router.get("/:id", getSongById);

// 3. POST Route for Song Upload (Admin only, Cloudinary Multer fields)
router.post(
  "/",
  protect,
  admin,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  createSong
);

// 4. Action Routes for Specific Songs
router.delete("/:id", protect, admin, deleteSong);
router.put("/:id/like", protect, toggleLikeSong);
router.post("/:id/play", protect, recordPlay);

module.exports = router;
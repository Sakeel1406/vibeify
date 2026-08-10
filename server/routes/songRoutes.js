const express = require("express");
const router = express.Router();
const {
  getSongs,
  getTopSongs,
  getSongById,
  createSong,
  deleteSong,
  toggleLikeSong,
  getLikedSongs,
  recordPlay,
  getRecentlyPlayed,
} = require("../controllers/songController");
const { protect, optionalProtect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { streamLimiter } = require("../middleware/rateLimiter");

//  Specific Static GET Routes (Must come BEFORE dynamic /:id route)
router.get("/", getSongs);
router.get("/top", getTopSongs);
router.get("/liked/me", protect, getLikedSongs);
router.get("/recent/me", protect, getRecentlyPlayed);

//  Dynamic GET Route (Handles single song fetch by MongoDB ObjectId)
router.get("/:id", getSongById);

//  POST Route for Song Upload (Admin only, Cloudinary Multer fields)
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

// Action Routes for Specific Songs
router.delete("/:id", protect, admin, deleteSong);
router.put("/:id/like", protect, toggleLikeSong);

//  STREAM & HISTORY ROUTE (Optional Auth + Guest Limit)
// Step 1: optionalProtect -> Checks for JWT token without blocking guests.
// Step 2: streamLimiter -> If req.user exists, skips limit. If guest, enforces 5-play/15min limit.
// Step 3: recordPlay -> Saves recently played for users / returns success for guests.
router.post("/:id/play", optionalProtect, streamLimiter, recordPlay);

module.exports = router;
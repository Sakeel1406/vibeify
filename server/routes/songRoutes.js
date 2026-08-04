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

router.get("/", getSongs);
router.get("/liked/me", protect, getLikedSongs);
router.get("/recent/me", protect, getRecentlyPlayed);
router.get("/:id", getSongById);

router.post(
  "/",
  protect,
  admin,
  upload.fields([{ name: "audio", maxCount: 1 }, { name: "image", maxCount: 1 }]),
  createSong
);

router.delete("/:id", protect, admin, deleteSong);
router.put("/:id/like", protect, toggleLikeSong);
router.post("/:id/play", protect, recordPlay);

module.exports = router;

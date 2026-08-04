const express = require("express");
const router = express.Router();
const {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} = require("../controllers/playlistController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getPlaylists);
router.get("/:id", protect, getPlaylistById);
router.post("/", protect, createPlaylist);
router.put("/:id", protect, updatePlaylist);
router.delete("/:id", protect, deletePlaylist);

module.exports = router;
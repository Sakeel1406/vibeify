const express = require("express");
const router = express.Router();
const { getArtists, addArtist, deleteArtist } = require("../controllers/artistController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", getArtists);

router.post("/", protect, admin, upload.single("image"), addArtist);

router.delete("/:id", protect, admin, deleteArtist);

module.exports = router;
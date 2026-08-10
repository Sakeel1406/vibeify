const express = require("express");
const router = express.Router();
const { getUserProfile, updateUserProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/users/profile
router.get("/profile", protect, getUserProfile);

// PUT /api/users/profile 
router.put("/profile", protect, updateUserProfile);

module.exports = router;
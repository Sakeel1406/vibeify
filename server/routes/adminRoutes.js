const express = require("express");
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// Secure all admin endpoints with auth & admin verification
router.use(protect, admin);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

module.exports = router;
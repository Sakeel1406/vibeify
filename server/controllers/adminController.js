const User = require("../models/User");
const Song = require("../models/Song");
const Playlist = require("../models/Playlist");

// Get dashboard statistics & upload analytics
// GET /api/admin/stats
// Private/Admin
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalSongs, totalPlaylists, totalAdmins] = await Promise.all([
      User.countDocuments(),
      Song.countDocuments(),
      Playlist.countDocuments(),
      User.countDocuments({ role: "admin" }),
    ]);

    // Calculate start date for last 7 days chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentSongs = await Song.find({ createdAt: { $gte: sevenDaysAgo } }).select("createdAt");

    // Initialize 7-day buckets (YYYY-MM-DD)
    const dayBuckets = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayBuckets[key] = 0;
    }

    // Populate counts per day
    recentSongs.forEach((song) => {
      const key = song.createdAt.toISOString().slice(0, 10);
      if (dayBuckets[key] !== undefined) dayBuckets[key] += 1;
    });

    const uploadActivity = Object.entries(dayBuckets).map(([date, count]) => ({ date, count }));

    // Fetch recent uploads and users concurrently
    const [recentUploads, recentUsers] = await Promise.all([
      Song.find().sort({ createdAt: -1 }).limit(5),
      User.find().sort({ createdAt: -1 }).limit(5).select("-password"),
    ]);

    res.json({
      totalUsers,
      totalSongs,
      totalPlaylists,
      totalAdmins,
      uploadActivity,
      recentUploads,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all registered users (with search query)
// GET /api/admin/users
// Private/Admin
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role (promote/demote)
// PUT /api/admin/users/:id/role
// Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
    }

    // Prevent self-demotion
    if (req.params.id === req.user._id.toString() && role === "user") {
      return res.status(400).json({ message: "You can't remove your own admin access" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user account and their associated playlists
// DELETE /api/admin/users/:id
// Private/Admin
const deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't delete your own account from here" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    await Playlist.deleteMany({ userId: user._id });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
};
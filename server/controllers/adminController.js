const User = require("../models/User");
const Song = require("../models/Song");
const Playlist = require("../models/Playlist");

// @route GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalSongs, totalPlaylists, totalAdmins] = await Promise.all([
      User.countDocuments(),
      Song.countDocuments(),
      Playlist.countDocuments(),
      User.countDocuments({ role: "admin" }),
    ]);

    // songs added per day for the last 7 days (simple upload activity chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentSongs = await Song.find({ createdAt: { $gte: sevenDaysAgo } }).select("createdAt");

    const dayBuckets = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayBuckets[key] = 0;
    }
    recentSongs.forEach((song) => {
      const key = song.createdAt.toISOString().slice(0, 10);
      if (dayBuckets[key] !== undefined) dayBuckets[key] += 1;
    });

    const uploadActivity = Object.entries(dayBuckets).map(([date, count]) => ({ date, count }));

    // most recently added songs
    const recentUploads = await Song.find().sort({ createdAt: -1 }).limit(5);

    // most recently registered users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("-password");

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

// @route GET /api/admin/users
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

// @route PUT /api/admin/users/:id/role  { role: "admin" | "user" }
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
    }

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

// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't delete your own account from here" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    await Playlist.deleteMany({ userId: user._id });

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getUsers, updateUserRole, deleteUser };

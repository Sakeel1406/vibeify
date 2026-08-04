const Playlist = require("../models/Playlist");
const User = require("../models/User");

// @desc    Get user profile with live stats
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Dynamic count directly from Playlist model using userId
    const playlistsCount = await Playlist.countDocuments({ userId: userId });

    res.json({
      ...user.toObject(),
      playlistsCreatedCount: playlistsCount,
      likedSongsCount: user.likedSongs ? user.likedSongs.length : 0,
      songsPlayedCount: user.recentlyPlayed ? user.recentlyPlayed.length : 0,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

module.exports = {
  getUserProfile,
};
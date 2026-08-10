const Playlist = require("../models/Playlist");
const User = require("../models/User");

// Get user profile with live stats
// GET /api/users/profile
// Private
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

// Update user profile (Username/Details)
// PUT /api/users/profile
// Private
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Username cannot be empty" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: username.trim() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the full updated profile structure with live counts
    const playlistsCount = await Playlist.countDocuments({ userId: userId });

    res.json({
      ...updatedUser.toObject(),
      playlistsCreatedCount: playlistsCount,
      likedSongsCount: updatedUser.likedSongs ? updatedUser.likedSongs.length : 0,
      songsPlayedCount: updatedUser.recentlyPlayed ? updatedUser.recentlyPlayed.length : 0,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
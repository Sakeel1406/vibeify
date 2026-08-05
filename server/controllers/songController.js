const Song = require("../models/Song");
const User = require("../models/User");

// Get all songs (with optional search filter)
// GET /api/songs
// Public
const getSongs = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { artist: { $regex: search, $options: "i" } },
          { album: { $regex: search, $options: "i" } },
        ],
      };
    }

    const songs = await Song.find(query).sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single song by ID
// GET /api/songs/:id
// Public
const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create/Upload a new song to Cloudinary
// POST /api/songs
// Private/Admin
const createSong = async (req, res) => {
  try {
    const { title, artist, album, duration } = req.body;

    if (!req.files || !req.files.audio) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    // Retrieve Cloudinary secure URLs from req.files
    const audioUrl = req.files.audio[0].path;
    const imageUrl = req.files.image ? req.files.image[0].path : "";

    const song = await Song.create({
      title,
      artist,
      album: album || "Single",
      duration: duration || 0,
      songUrl: audioUrl,     // Cloudinary CDN link
      coverImage: imageUrl,  // Cloudinary CDN link
      audio: audioUrl,       // Fallback for frontend field reference
      image: imageUrl,       // Fallback for frontend field reference
    });

    res.status(201).json({
      message: "Song uploaded successfully!",
      song,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete song from Database
// DELETE /api/songs/:id
// Private/Admin
const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    await song.deleteOne();
    res.json({ message: "Song deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle like / unlike song
// PUT /api/songs/:id/like
// Private
const toggleLikeSong = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const songId = req.params.id;

    const alreadyLiked = user.likedSongs.some((id) => id.toString() === songId);

    if (alreadyLiked) {
      user.likedSongs = user.likedSongs.filter((id) => id.toString() !== songId);
    } else {
      user.likedSongs.push(songId);
    }

    await user.save();
    res.json({ likedSongs: user.likedSongs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's liked songs
// GET /api/songs/liked/me
// Private
const getLikedSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("likedSongs");
    res.json(user.likedSongs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record played song in history
// POST /api/songs/:id/play
// Private
const recordPlay = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const songId = req.params.id;

    user.recentlyPlayed = user.recentlyPlayed.filter((id) => id.toString() !== songId);
    user.recentlyPlayed.unshift(songId);
    user.recentlyPlayed = user.recentlyPlayed.slice(0, 20);

    await user.save();
    res.json({ recentlyPlayed: user.recentlyPlayed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's recently played songs
// GET /api/songs/recent/me
// Private
const getRecentlyPlayed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("recentlyPlayed");
    res.json(user.recentlyPlayed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSongs,
  getSongById,
  createSong,
  deleteSong,
  toggleLikeSong,
  getLikedSongs,
  recordPlay,
  getRecentlyPlayed,
};
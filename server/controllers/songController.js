const Song = require("../models/Song");
const User = require("../models/User");

// @desc    Get all songs (with optional search filter)
// @route   GET /api/songs
// @access  Public
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

// @desc    Get single song by ID
// @route   GET /api/songs/:id
// @access  Public
const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create/Upload a new song to Cloudinary
// @route   POST /api/songs
// @access  Private/Admin
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

// @desc    Delete song from Database
// @route   DELETE /api/songs/:id
// @access  Private/Admin
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

// @desc    Toggle like / unlike song
// @route   PUT /api/songs/:id/like
// @access  Private
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

// @desc    Get user's liked songs
// @route   GET /api/songs/liked/me
// @access  Private
const getLikedSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("likedSongs");
    res.json(user.likedSongs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record played song in history
// @route   POST /api/songs/:id/play
// @access  Private
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

// @desc    Get user's recently played songs
// @route   GET /api/songs/recent/me
// @access  Private
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
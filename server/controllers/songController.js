const Song = require("../models/Song");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// @route GET /api/songs
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

// @route GET /api/songs/:id
const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/songs (admin, multipart form: audio, image, title, artist, album, duration)
const createSong = async (req, res) => {
  try {
    const { title, artist, album, duration } = req.body;

    if (!req.files || !req.files.audio || !req.files.image) {
      return res.status(400).json({ message: "Audio and image files are required" });
    }

    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];

    const song = await Song.create({
      title,
      artist,
      album: album || "Single",
      duration: duration || 0,
      audio: `/uploads/songs/${audioFile.filename}`,
      image: `/uploads/images/${imageFile.filename}`,
    });

    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/songs/:id (admin)
const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    // remove files from disk (best-effort)
    [song.audio, song.image].forEach((relPath) => {
      const fullPath = path.join(__dirname, "..", relPath);
      fs.unlink(fullPath, () => {});
    });

    await song.deleteOne();
    res.json({ message: "Song deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/songs/:id/like (toggle like)
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

// @route GET /api/songs/liked/me
const getLikedSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("likedSongs");
    res.json(user.likedSongs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/songs/:id/play (record recently played)
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

// @route GET /api/songs/recent/me
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

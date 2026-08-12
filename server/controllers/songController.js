const Song = require("../models/Song");
const User = require("../models/User");

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
          { category: { $regex: search, $options: "i" } },
        ],
      };
    }

    const songs = await Song.find(query).sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopSongs = async (req, res) => {
  try {
    const topSongs = await Song.find({}).sort({ createdAt: -1 }).limit(20);
    res.json(topSongs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSong = async (req, res) => {
  try {
    const { title, artist, album, duration, category, genre } = req.body;

    if (!req.files || !req.files.audio) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    const audioUrl = req.files.audio[0].path;
    const imageUrl = req.files.image ? req.files.image[0].path : "";

    const song = await Song.create({
      title,
      artist,
      album: album || "Single",
      category: category || "General",
      genre: genre || "General",
      duration: duration || 0,
      songUrl: audioUrl,
      coverImage: imageUrl,
      audio: audioUrl,
      image: imageUrl,
    });

    res.status(201).json({
      message: "Song uploaded successfully!",
      song,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

const getLikedSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("likedSongs");
    res.json(user.likedSongs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const recordPlay = async (req, res) => {
  try {
    const songId = req.params.id;

    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.recentlyPlayed = user.recentlyPlayed.filter((id) => id.toString() !== songId);
        user.recentlyPlayed.unshift(songId);
        user.recentlyPlayed = user.recentlyPlayed.slice(0, 20);
        await user.save();
        return res.json({ recentlyPlayed: user.recentlyPlayed });
      }
    }

    res.json({ success: true, message: "Play recorded for guest stream" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecentlyPlayed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("recentlyPlayed");
    res.json(user.recentlyPlayed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearRecentlyPlayed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.recentlyPlayed = [];
    await user.save();

    res.json({ message: "Recently played history cleared", recentlyPlayed: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSongs,
  getTopSongs,
  getSongById,
  createSong,
  deleteSong,
  toggleLikeSong,
  getLikedSongs,
  recordPlay,
  getRecentlyPlayed,
  clearRecentlyPlayed,
};
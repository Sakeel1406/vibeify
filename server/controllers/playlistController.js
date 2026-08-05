const Playlist = require("../models/Playlist");

// @route   GET /api/playlists
// @desc    Get all playlists owned by the authenticated user
// @access  Private
const getPlaylists = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized. User context missing." });
    }

    const userId = req.user._id || req.user.id;
    const playlists = await Playlist.find({ userId })
      .populate("songs")
      .sort({ createdAt: -1 });

    return res.json(playlists);
  } catch (error) {
    console.error("GET PLAYLISTS ERROR:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch playlists" });
  }
};

// @route   GET /api/playlists/:id
// @desc    Get a single playlist by ID
// @access  Private
const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("songs");
    
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    return res.json(playlist);
  } catch (error) {
    console.error("GET PLAYLIST BY ID ERROR:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch playlist" });
  }
};

// @route   POST /api/playlists
// @desc    Create a new playlist
// @access  Private
const createPlaylist = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized. User context missing." });
    }

    const { name, isPublic, coverImage } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Playlist name is required." });
    }

    const userId = req.user._id || req.user.id;

    const playlist = await Playlist.create({
      name: name.trim(),
      isPublic: isPublic !== undefined ? isPublic : true,
      coverImage: coverImage || "",
      userId,
      songs: [],
    });

    return res.status(201).json(playlist);
  } catch (error) {
    console.error("CREATE PLAYLIST ERROR DETAILS:", error);
    return res.status(500).json({ message: error.message || "Server Error Creating Playlist" });
  }
};

// @route   PUT /api/playlists/:id
// @desc    Update playlist info, privacy toggles, or manage songs
// @access  Private
const updatePlaylist = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized. User context missing." });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const currentUserId = req.user._id || req.user.id;
    if (playlist.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this playlist" });
    }

    const { name, isPublic, coverImage, addSongId, songId, removeSongId } = req.body;

    if (name) playlist.name = name.trim();
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (coverImage !== undefined) playlist.coverImage = coverImage;

    // Handle song addition (supports both addSongId and songId)
    const targetSongId = addSongId || songId;
    if (targetSongId && !playlist.songs.some((id) => id.toString() === targetSongId.toString())) {
      playlist.songs.push(targetSongId);
    }

    // Remove song from playlist
    if (removeSongId) {
      playlist.songs = playlist.songs.filter((id) => id.toString() !== removeSongId.toString());
    }

    await playlist.save();
    const updated = await playlist.populate("songs");

    return res.json(updated);
  } catch (error) {
    console.error("UPDATE PLAYLIST ERROR:", error);
    return res.status(500).json({ message: error.message || "Failed to update playlist" });
  }
};

// @route   DELETE /api/playlists/:id
// @desc    Delete a playlist by ID
// @access  Private
const deletePlaylist = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized. User context missing." });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const currentUserId = req.user._id || req.user.id;
    if (playlist.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this playlist" });
    }

    await playlist.deleteOne();
    return res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("DELETE PLAYLIST ERROR:", error);
    return res.status(500).json({ message: error.message || "Failed to delete playlist" });
  }
};

module.exports = {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
};
const Artist = require("../models/Artist");
const fs = require("fs");
const path = require("path");

// GET /api/artists
const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find().sort({ createdAt: -1 });
    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/artists (admin, multipart: name, role, image)
const addArtist = async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!name || !req.file) {
      return res.status(400).json({ message: "Artist name and photo are required" });
    }

    const artist = await Artist.create({
      name: name.trim(),
      role: role?.trim() || "Composer / Artist",
      image: `/uploads/images/${req.file.filename}`,
    });

    res.status(201).json(artist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/artists/:id (admin)
const deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    const fullPath = path.join(__dirname, "..", artist.image);
    fs.unlink(fullPath, () => {});

    await artist.deleteOne();
    res.json({ message: "Artist deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getArtists, addArtist, deleteArtist };
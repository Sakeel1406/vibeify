const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    album: { type: String, default: "Single" },
    image: { type: String, required: true },
    audio: { type: String, required: true },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);

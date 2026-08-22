const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "Composer / Artist", trim: true },
    image: { type: String, required: true },
    streams: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artist", artistSchema);
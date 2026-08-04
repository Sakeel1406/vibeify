const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Allowed origins for development and production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://vibeify-ashy.vercel.app",
  process.env.CLIENT_URL
].filter(Boolean);

// CORS configuration supporting credentials and multiple origins
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., Postman or mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded audio/image files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// API ROUTES
// ==========================================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/songs", require("./routes/songRoutes"));
app.use("/api/playlists", require("./routes/playlistRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// User routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Spotify Clone API is running");
});

// ==========================================
// ERROR HANDLERS
// ==========================================

// 404 handler (Must be below all other routes)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
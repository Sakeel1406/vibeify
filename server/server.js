const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Allowed origins for local development and production deployments
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://vibeify-ashy.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

// Dynamic CORS configuration supporting cookies/headers across allowed origins
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., Postman, Curl, Mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads statically as fallback (if needed)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// API ROUTES
// ==========================================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/songs", require("./routes/songRoutes"));
app.use("/api/playlists", require("./routes/playlistRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Root Health Check Route
app.get("/", (req, res) => {
  res.send("Vibeify API is running cleanly!");
});

// ==========================================
// ERROR HANDLING MIDDLEWARES
// ==========================================

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("Error Stack:", err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
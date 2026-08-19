const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const { globalLimiter } = require("./middleware/rateLimiter");

dotenv.config();
connectDB();

const app = express();

//  CRITICAL FOR RATE LIMITING ON RENDER / VERCEL:
app.set("trust proxy", 1);

// Allowed origins configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://vibeify-ashy.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Skip rate limiting for Auth routes and general song fetches
app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/auth") || (req.method === "GET" && req.path === "/songs")) {
    return next();
  }
  return globalLimiter(req, res, next);
});

// API ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/songs", require("./routes/songRoutes"));
app.use("/api/playlists", require("./routes/playlistRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Root Health Check Route
app.get("/", (req, res) => {
  res.send("Vibeify API is running cleanly!");
});

// ERROR HANDLING MIDDLEWARES
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error Stack:", err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

//  LOCAL VS VERCEL SERVERLESS EXPORT
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// Export the app for Vercel serverless deployment using CommonJS
module.exports = app;
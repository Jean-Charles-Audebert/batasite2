const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const { pool, testConnection, initDb, seedAdmins, seedMedia, seedContent } = require("./config/db");

const authRoutes = require("./routes/auth");
const siteRoutes = require("./routes/site");
const mediaRoutes = require("./routes/media");
const contactRoutes = require("./routes/contact");
const adminsRoutes = require("./routes/admins");

const app = express();
const PORT = process.env.PORT || 5000;

/* ----------------------------------
   Middleware
---------------------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ];
  
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS, PUT");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Max-Age", "3600");
  }
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ----------------------------------
   Routes
---------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admins", adminsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

/* ----------------------------------
   Error handling
---------------------------------- */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

/* ----------------------------------
   Init & Start
---------------------------------- */
const start = async () => {
  try {
    console.log("\n🚀 Starting server...\n");

    // Test connection
    await testConnection();

    // Init DB & seed
    await initDb();
    await seedAdmins();
    await seedMedia();
    await seedContent();

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error("\n✗ Failed to start server:", err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\nShutting down gracefully...");
  await pool.end();
  process.exit(0);
});

start();

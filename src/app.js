const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("./config");
const db = require("./db");

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health Check
app.get("/health", async (req, res) => {
  try {
    await db.raw("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", db: "disconnected", error: err.message });
  }
});

// Routes
app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/tenants", require("./modules/tenants/tenants.routes"));
app.use("/api/users", require("./modules/users/users.routes"));
app.use("/api/projects", require("./modules/projects/projects.routes"));
app.use("/api/tasks", require("./modules/tasks/tasks.routes"));

// Error Helper
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: config.env === "development" ? err : {},
  });
});

module.exports = app;

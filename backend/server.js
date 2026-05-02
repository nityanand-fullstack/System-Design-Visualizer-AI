import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import systemRoutes from "./routes/systemRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "System Design Visualizer API",
    endpoints: {
      health: "GET /api/health",
      listSystems: "GET /api/systems",
      getSystem: "GET /api/systems/:slug",
      createSystem: "POST /api/systems",
      explain: "POST /api/explain",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "System Design Visualizer API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/systems", systemRoutes);
app.use("/api/explain", aiRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, _next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});





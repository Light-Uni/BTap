require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { runSetup } = require("./schema");

const auth = require("./middlewares/authMiddleware");

const authRoutes = require("./routes/auth.routes");
const medicineRoutes = require("./routes/medicines.routes");
const userRoutes = require("./routes/users.routes");
const auditRoutes = require("./routes/audits.routes");
const exportRequestRoutes = require("./routes/export_requests.routes");
const importRequestRoutes = require("./routes/import_requests.routes");
const importNotificationRoutes = require("./routes/importNotification");
const dashboardRoutes = require("./routes/dashboard.routes");
const batchesRoutes = require("./routes/batches.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const inventoryLogsRoutes = require("./routes/inventory_logs.routes");
const reportRoutes = require("./routes/reports.routes");
const disposalRoutes = require("./routes/disposal.routes");

const app = express();
const uploadsPath = path.join(__dirname, "assets", "uploads");
const seedUploadsPath = path.join(__dirname, "assets", "seed-uploads");

fs.mkdirSync(uploadsPath, { recursive: true });

if (fs.existsSync(seedUploadsPath)) {
  for (const entry of fs.readdirSync(seedUploadsPath, { withFileTypes: true })) {
    if (!entry.isFile()) continue;

    const sourcePath = path.join(seedUploadsPath, entry.name);
    const targetPath = path.join(uploadsPath, entry.name);

    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Public routes
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static(uploadsPath));

// Protected routes
app.use("/api/medicines", auth, medicineRoutes);
app.use("/api/users", auth, userRoutes);
app.use("/api/audits", auth, auditRoutes);
app.use("/api/export-requests", auth, exportRequestRoutes);
app.use("/api/import-requests", auth, importRequestRoutes);
app.use("/api/import-notifications", auth, importNotificationRoutes);
app.use("/api/dashboard", auth, dashboardRoutes);
app.use("/api/batches", auth, batchesRoutes);
app.use("/api/inventory", auth, inventoryRoutes);
app.use("/api/inventory-logs", auth, inventoryLogsRoutes);
app.use("/api/reports", auth, reportRoutes);
app.use("/api/disposals", auth, disposalRoutes);

require("./jobs/expiryAlertJob");

const PORT = process.env.PORT || 3000;

runSetup()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Server startup failed:", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
    });
    process.exit(1);
  });

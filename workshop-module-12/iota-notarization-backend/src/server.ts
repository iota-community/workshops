import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import notarizationRoutes from "./routes/notarizationRoutes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/notarizations", notarizationRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "IOTA Notarization Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "GET /api/notarizations/health",
      walletInfo: "GET /api/notarizations/wallet/info",
      createHash: "POST /api/notarizations/hash (multipart/form-data, field: file)", 
      createDynamic: "POST /api/notarizations/dynamic",
      createLocked: "POST /api/notarizations/locked",
      updateState: "PUT /api/notarizations/:id/state",
      updateMetadata: "PUT /api/notarizations/:id/metadata",
      transfer: "POST /api/notarizations/:id/transfer",
      destroy: "DELETE /api/notarizations/:id",
      getDetails: "GET /api/notarizations/:id",
      verify: "POST /api/notarizations/verify",
    },
    documentation: "Use Postman to test all endpoints",
  });
});

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: error.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "GET /",
      "GET /api/notarizations/health",
      "POST /api/notarizations/dynamic",
      "POST /api/notarizations/locked",
      "GET /api/notarizations/:id",
      "POST /api/notarizations/verify",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 IOTA Notarization Backend running on port ${PORT}`);
  console.log(`📡 Connected to network: testnet`);
  console.log(`🔗 Package ID: ${process.env.IOTA_NOTARIZATION_PKG_ID}`);
  console.log(`🌐 API Base: http://localhost:${PORT}/api/notarizations`);
  console.log(
    `💚 Health check: http://localhost:${PORT}/api/notarizations/health`
  );
  console.log(`📋 API Documentation: http://localhost:${PORT}/`);
});

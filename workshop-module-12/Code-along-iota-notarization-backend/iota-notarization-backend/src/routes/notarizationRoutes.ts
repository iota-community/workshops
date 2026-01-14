import { Router } from "express";
import { NotarizationController } from "../controllers/notarizationController";
import multer from "multer";
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB limit

const router = Router();
const controller = new NotarizationController();

/**
 * TODO:
 * Add all API routes here in correct order.
 *
 * Order matters:
 * 1) Specific routes first (health, wallet/info)
 * 2) Then create/update/transfer/destroy routes
 * 3) Parameterized routes last (/:notarizationId)
 *
 * Coding Challenge:
 * Add the route:
 * POST /hash  -> upload.single("file") -> controller.createFileHash
 */

// TODO: System Operations (specific routes first)

// TODO: Notarization Operations

// TODO: Query Operations (parameterized routes last)

export default router;
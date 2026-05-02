import express from "express";
import { explainSystem, searchSystem } from "../controllers/aiController.js";

const router = express.Router();

router.post("/", explainSystem);
router.post("/search", searchSystem);

export default router;

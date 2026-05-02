import express from "express";
import {
  getAllSystems,
  getSystemBySlug,
  createSystem,
  updateSystem,
  deleteSystem,
} from "../controllers/systemController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router
  .route("/")
  .get(getAllSystems)
  .post(requireAdmin, createSystem);

router
  .route("/:slug")
  .get(getSystemBySlug)
  .put(requireAdmin, updateSystem)
  .delete(requireAdmin, deleteSystem);

export default router;

import express from "express";
import { protect, admin } from "../middleware/auth.js";
import {
  listUsers,
  getUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAnalytics,
  getAiUsage,
  getSystemLogs,
  broadcastNotification,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, admin);

router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/analytics", getAnalytics);
router.get("/ai-usage", getAiUsage);
router.get("/logs", getSystemLogs);
router.post("/broadcast", broadcastNotification);

export default router;

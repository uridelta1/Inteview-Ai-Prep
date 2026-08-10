import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getDashboard,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.use(protect);
router.get("/", getDashboard);
router.get("/notifications", getNotifications);
router.put("/notifications/:id/read", markNotificationRead);
router.put("/notifications/read-all", markAllNotificationsRead);

export default router;

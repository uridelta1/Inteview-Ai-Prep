import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
} from "../controllers/userController.js";

const router = express.Router();

router.use(protect);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.delete("/account", deactivateAccount);

export default router;

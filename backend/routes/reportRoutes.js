import express from "express";
import { protect } from "../middleware/auth.js";
import { listReports, getReport, exportReportPdf } from "../controllers/reportController.js";

const router = express.Router();

router.use(protect);
router.get("/", listReports);
router.get("/:id", getReport);
router.get("/:id/export", exportReportPdf);

export default router;

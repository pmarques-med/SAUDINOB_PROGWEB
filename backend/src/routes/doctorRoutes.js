import {Router} from "express";
import {authenticate} from "../middleware/auth.js";
import {getDoctorPatientsController,getDoctorAlertsController} from "../controllers/doctorController.js";
const router=Router(); router.use(authenticate);
router.get("/:id/patients",getDoctorPatientsController);
router.get("/:id/alerts",getDoctorAlertsController);
export default router;

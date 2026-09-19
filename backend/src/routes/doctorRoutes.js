import {Router} from "express";
import {authenticate} from "../middleware/auth.js";
import {getDoctorPatientsController,getDoctorAlertsController,createDoctorPatientController} from "../controllers/doctorController.js";
const router=Router(); router.use(authenticate);
router.get("/:id/patients",getDoctorPatientsController);
router.post("/:id/patients",createDoctorPatientController);
router.get("/:id/alerts",getDoctorAlertsController);
export default router;

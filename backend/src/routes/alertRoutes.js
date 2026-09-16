import {Router} from "express";
import {authenticate} from "../middleware/auth.js";
import {updateAlertController} from "../controllers/alertController.js";
const router=Router(); router.patch("/:id",authenticate,updateAlertController);
export default router;

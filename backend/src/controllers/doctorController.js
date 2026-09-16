import {getDoctorPatients,getDoctorAlerts} from "../services/doctorService.js";
const allowed=(req,id)=>req.user.role==="ADMIN"||(req.user.role==="DOCTOR"&&Number(req.user.sub)===Number(id));
export function getDoctorPatientsController(req,res,next){try{
 if(!allowed(req,req.params.id))return res.status(403).json({error:"Forbidden"});
 res.json(getDoctorPatients(req.params.id));
}catch(e){next(e)}}
export function getDoctorAlertsController(req,res,next){try{
 if(!allowed(req,req.params.id))return res.status(403).json({error:"Forbidden"});
 res.json(getDoctorAlerts(req.params.id));
}catch(e){next(e)}}

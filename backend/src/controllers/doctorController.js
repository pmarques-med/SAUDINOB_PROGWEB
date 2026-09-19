import {getDoctorPatients,getDoctorAlerts,createDoctorPatient} from "../services/doctorService.js";
const allowed=(req,id)=>req.user.role==="ADMIN"||(req.user.role==="DOCTOR"&&Number(req.user.sub)===Number(id));
export function getDoctorPatientsController(req,res,next){try{
 if(!allowed(req,req.params.id))return res.status(403).json({error:"Forbidden"});
 res.json(getDoctorPatients(req.params.id));
}catch(e){next(e)}}
export function getDoctorAlertsController(req,res,next){try{
 if(!allowed(req,req.params.id))return res.status(403).json({error:"Forbidden"});
 res.json(getDoctorAlerts(req.params.id));
}catch(e){next(e)}}
export function createDoctorPatientController(req,res,next){try{
 if(!allowed(req,req.params.id))return res.status(403).json({error:"Forbidden"});
 const d=req.body;
 const required=["name","email","birthDate","sex","admissionDate","height","weight"];
 const missing=required.filter(k=>d[k]===undefined||d[k]===null||d[k]==="");
 if(missing.length) return res.status(400).json({error:`Missing required fields: ${missing.join(", ")}`});
 const height=Number(d.height), weight=Number(d.weight);
 if(!Number.isFinite(height)||height<=0||!Number.isFinite(weight)||weight<=0)
   return res.status(400).json({error:"height and weight must be positive numbers"});
 const patient=createDoctorPatient(req.params.id,{...d,height,weight});
 res.status(201).json(patient);
}catch(e){
 if(String(e.message).includes("UNIQUE constraint failed: users.email"))
   return res.status(409).json({error:"Email already exists"});
 next(e)
}}

import {getPatient,getCaratEvaluations,createCaratEvaluation,getPatientAlerts} from "../services/patientService.js";

const canAccess=(req,id)=>req.user.role==="ADMIN" || req.user.role==="DOCTOR" || Number(req.user.sub)===Number(id);

export function getPatientController(req,res,next){try{
  if(!canAccess(req,req.params.id)) return res.status(403).json({error:"Forbidden"});
  const p=getPatient(req.params.id);
  if(!p) return res.status(404).json({error:"Patient not found"});
  res.json(p);
}catch(e){next(e)}}

export function getCaratController(req,res,next){try{
  if(!canAccess(req,req.params.id)) return res.status(403).json({error:"Forbidden"});
  res.json(getCaratEvaluations(req.params.id));
}catch(e){next(e)}}

export function createCaratController(req,res,next){try{
  if(req.user.role!=="PATIENT" || Number(req.user.sub)!==Number(req.params.id))
    return res.status(403).json({error:"Only the patient can submit this evaluation"});
  const score=Number(req.body.score);
  if(!Number.isFinite(score)||score<0||score>30)
    return res.status(400).json({error:"score must be a number between 0 and 30"});
  res.status(201).json(createCaratEvaluation(req.params.id,score));
}catch(e){next(e)}}

export function getPatientAlertsController(req,res,next){try{
  if(!canAccess(req,req.params.id)) return res.status(403).json({error:"Forbidden"});
  res.json(getPatientAlerts(req.params.id));
}catch(e){next(e)}}

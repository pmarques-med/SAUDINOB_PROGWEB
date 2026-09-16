import {updateAlert} from "../services/alertService.js";
export function updateAlertController(req,res,next){try{
 if(!req.body.status)return res.status(400).json({error:"status is required"});
 res.json(updateAlert(req.params.id,req.body.status,req.user));
}catch(e){next(e)}}

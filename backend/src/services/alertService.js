import {db} from "../db/database.js";
const states=["NOVO","VISTO","EM_SEGUIMENTO","FECHADO"];
export function updateAlert(id,status,user){
 if(!states.includes(status)){const e=new Error("Invalid alert status");e.status=400;throw e;}
 const a=db.prepare("SELECT * FROM alerts WHERE id=?").get(id);
 if(!a){const e=new Error("Alert not found");e.status=404;throw e;}
 if(user.role!=="ADMIN" && !(user.role==="DOCTOR"&&Number(user.sub)===Number(a.doctor_id))){
   const e=new Error("Forbidden");e.status=403;throw e;
 }
 db.prepare("UPDATE alerts SET status=? WHERE id=?").run(status,id);
 return {id:Number(id),status};
}

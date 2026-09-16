import { db } from "../db/database.js";

export function getPatient(id) {
  return db.prepare("SELECT id,name,email,role FROM users WHERE id=? AND role='PATIENT'").get(id);
}
export function getCaratEvaluations(id) {
  return db.prepare(`SELECT id,patient_id AS patientId,date,score,
    control_level AS controlLevel FROM carat_evaluations
    WHERE patient_id=? ORDER BY date ASC`).all(id);
}
export function createCaratEvaluation(id,score) {
  let controlLevel="CONTROLLED";
  if(score<20) controlLevel="UNCONTROLLED";
  else if(score<25) controlLevel="PARTIALLY_CONTROLLED";
  const date=new Date().toISOString();
  const result=db.prepare(`INSERT INTO carat_evaluations
    (patient_id,date,score,control_level) VALUES (?,?,?,?)`).run(id,date,score,controlLevel);

  if(score<20) {
    const relation=db.prepare(
      "SELECT doctor_id AS doctorId FROM doctor_patients WHERE patient_id=? LIMIT 1"
    ).get(id);
    if(relation) db.prepare(`INSERT INTO alerts
      (patient_id,doctor_id,priority,reason,status,created_at)
      VALUES (?,?,?,?,?,?)`).run(
        id,relation.doctorId,"HIGH","CARAT abaixo do limiar de controlo","NOVO",date
      );
  }
  return {id:Number(result.lastInsertRowid),patientId:Number(id),date,score,controlLevel};
}
export function getPatientAlerts(id) {
  return db.prepare(`SELECT id,patient_id AS patientId,doctor_id AS doctorId,
    priority,reason,status,created_at AS createdAt FROM alerts
    WHERE patient_id=? ORDER BY created_at DESC`).all(id);
}

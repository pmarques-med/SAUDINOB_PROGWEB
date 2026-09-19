import { db } from "../db/database.js";

export function doctorCanAccessPatient(doctorId, patientId) {
  return Boolean(db.prepare(
    "SELECT 1 FROM doctor_patients WHERE doctor_id=? AND patient_id=?"
  ).get(doctorId, patientId));
}

export function getPatient(id) {
  const patient = db.prepare(`
    SELECT u.id,u.name,u.email,u.role,
      p.birth_date AS birthDate,p.sex,p.admission_date AS admissionDate,
      p.height,p.smoker,p.diabetes,p.hypertension,p.asthma,
      p.allergies,p.medication
    FROM users u
    LEFT JOIN patient_profiles p ON p.patient_id=u.id
    WHERE u.id=? AND u.role='PATIENT'
  `).get(id);
  if (!patient) return undefined;

  const latest = db.prepare(`
    SELECT date,weight,height FROM patient_measurements
    WHERE patient_id=? ORDER BY date DESC,id DESC LIMIT 1
  `).get(id);

  const height = latest?.height ?? patient.height;
  const weight = latest?.weight ?? null;
  const bmi = weight && height ? Number((weight/(height*height)).toFixed(1)) : null;

  return {
    id: patient.id,
    name: patient.name,
    email: patient.email,
    role: patient.role,
    birthDate: patient.birthDate,
    sex: patient.sex,
    admissionDate: patient.admissionDate,
    height,
    weight,
    bmi,
    clinicalHistory: {
      smoker: Boolean(patient.smoker),
      diabetes: Boolean(patient.diabetes),
      hypertension: Boolean(patient.hypertension),
      asthma: Boolean(patient.asthma),
      allergies: patient.allergies ?? "",
      medication: patient.medication ?? ""
    }
  };
}

export function getMeasurements(id) {
  return db.prepare(`SELECT id,date,weight,height FROM patient_measurements
    WHERE patient_id=? ORDER BY date ASC,id ASC`).all(id).map(m => ({
      ...m,
      bmi: Number((m.weight/(m.height*m.height)).toFixed(1))
    }));
}

export function getLatestVitals(id) {
  const exists = db.prepare("SELECT 1 FROM users WHERE id=? AND role='PATIENT'").get(id);
  if (!exists) return undefined;
  return {
    patientId: Number(id),
    heartRate: Math.floor(Math.random() * 41) + 60,
    timestamp: new Date().toISOString()
  };
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

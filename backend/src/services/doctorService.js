import bcrypt from "bcryptjs";
import {db} from "../db/database.js";

export const getDoctorPatients=id=>db.prepare(`SELECT u.id,u.name,u.email FROM users u
 JOIN doctor_patients dp ON dp.patient_id=u.id WHERE dp.doctor_id=? ORDER BY u.name`).all(id);
export const getDoctorAlerts=id=>db.prepare(`SELECT a.id,a.patient_id AS patientId,u.name AS patientName,
 a.priority,a.reason,a.status,a.created_at AS createdAt FROM alerts a
 JOIN users u ON u.id=a.patient_id WHERE a.doctor_id=? ORDER BY a.created_at DESC`).all(id);

export function createDoctorPatient(doctorId, data) {
  const passwordHash = bcrypt.hashSync("demo123", 10); // credencial apenas para o cenário didático
  db.exec("BEGIN");
  try {
    const userResult = db.prepare(`INSERT INTO users (name,email,password_hash,role)
      VALUES (?,?,?,'PATIENT')`).run(data.name, data.email, passwordHash);
    const patientId = Number(userResult.lastInsertRowid);

    db.prepare(`INSERT INTO patient_profiles
      (patient_id,birth_date,sex,admission_date,height,smoker,diabetes,hypertension,asthma,allergies,medication)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
        patientId,data.birthDate,data.sex,data.admissionDate,data.height,
        data.smoker?1:0,data.diabetes?1:0,data.hypertension?1:0,data.asthma?1:0,
        data.allergies || "",data.medication || ""
      );
    db.prepare("INSERT INTO doctor_patients (doctor_id,patient_id) VALUES (?,?)").run(doctorId,patientId);
    db.prepare(`INSERT INTO patient_measurements (patient_id,date,weight,height)
      VALUES (?,?,?,?)`).run(patientId,data.admissionDate,data.weight,data.height);
    db.exec("COMMIT");
    return {id:patientId,name:data.name,email:data.email};
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

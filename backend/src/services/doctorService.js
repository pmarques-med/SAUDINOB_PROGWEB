import {db} from "../db/database.js";
export const getDoctorPatients=id=>db.prepare(`SELECT u.id,u.name,u.email FROM users u
 JOIN doctor_patients dp ON dp.patient_id=u.id WHERE dp.doctor_id=? ORDER BY u.name`).all(id);
export const getDoctorAlerts=id=>db.prepare(`SELECT a.id,a.patient_id AS patientId,u.name AS patientName,
 a.priority,a.reason,a.status,a.created_at AS createdAt FROM alerts a
 JOIN users u ON u.id=a.patient_id WHERE a.doctor_id=? ORDER BY a.created_at DESC`).all(id);

import bcrypt from "bcryptjs";
import { db } from "./database.js";

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('PATIENT','DOCTOR','ADMIN'))
    );
    CREATE TABLE IF NOT EXISTS doctor_patients (
      doctor_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      PRIMARY KEY (doctor_id, patient_id),
      FOREIGN KEY (doctor_id) REFERENCES users(id),
      FOREIGN KEY (patient_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS carat_evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      score INTEGER NOT NULL,
      control_level TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('LOW','MEDIUM','HIGH')),
      reason TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('NOVO','VISTO','EM_SEGUIMENTO','FECHADO')),
      created_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES users(id),
      FOREIGN KEY (doctor_id) REFERENCES users(id)
    );
  `);

  const { count } = db.prepare("SELECT COUNT(*) AS count FROM users").get();
  if (count > 0) return;

  const passwordHash = bcrypt.hashSync("demo123", 10);
  const addUser = db.prepare(
    "INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)"
  );
  [
    [1,"Ana Martins","ana.patient@example.org",passwordHash,"PATIENT"],
    [2,"Bruno Costa","bruno.patient@example.org",passwordHash,"PATIENT"],
    [3,"Carla Sousa","carla.patient@example.org",passwordHash,"PATIENT"],
    [10,"Dr. Miguel Ferreira","miguel.doctor@example.org",passwordHash,"DOCTOR"],
    [20,"Administrador","admin@example.org",passwordHash,"ADMIN"]
  ].forEach(u => addUser.run(...u));

  const rel = db.prepare("INSERT INTO doctor_patients (doctor_id,patient_id) VALUES (?,?)");
  [1,2,3].forEach(id => rel.run(10,id));

  const addEval = db.prepare(
    "INSERT INTO carat_evaluations (patient_id,date,score,control_level) VALUES (?,?,?,?)"
  );
  [
    [1,"2026-06-15",24,"PARTIALLY_CONTROLLED"],
    [1,"2026-07-15",20,"PARTIALLY_CONTROLLED"],
    [1,"2026-08-15",16,"UNCONTROLLED"],
    [3,"2026-08-20",27,"CONTROLLED"]
  ].forEach(e => addEval.run(...e));

  const addAlert = db.prepare(
    "INSERT INTO alerts (patient_id,doctor_id,priority,reason,status,created_at) VALUES (?,?,?,?,?,?)"
  );
  addAlert.run(1,10,"HIGH","Deterioração do controlo respiratório","NOVO","2026-08-15T10:30:00Z");
  addAlert.run(3,10,"LOW","Reavaliar sintomas na próxima consulta","VISTO","2026-08-20T12:00:00Z");

  console.log("Base de dados inicial criada com dados de demonstração.");
}

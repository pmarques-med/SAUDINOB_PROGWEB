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
    CREATE TABLE IF NOT EXISTS patient_profiles (
      patient_id INTEGER PRIMARY KEY,
      birth_date TEXT NOT NULL,
      sex TEXT NOT NULL,
      admission_date TEXT NOT NULL,
      height REAL NOT NULL,
      smoker INTEGER NOT NULL DEFAULT 0,
      diabetes INTEGER NOT NULL DEFAULT 0,
      hypertension INTEGER NOT NULL DEFAULT 0,
      asthma INTEGER NOT NULL DEFAULT 0,
      allergies TEXT,
      medication TEXT,
      FOREIGN KEY (patient_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS patient_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      weight REAL NOT NULL,
      height REAL NOT NULL,
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

  const addProfile = db.prepare(`INSERT INTO patient_profiles
    (patient_id,birth_date,sex,admission_date,height,smoker,diabetes,hypertension,asthma,allergies,medication)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  [
    [1,"1981-05-14","F","2026-01-10",1.67,0,0,1,0,"Penicilina","Losartan"],
    [2,"1974-11-02","M","2026-02-03",1.78,1,0,0,0,"",""],
    [3,"1990-08-21","F","2026-03-12",1.62,0,1,0,1,"Ácaros","Salbutamol SOS"]
  ].forEach(x => addProfile.run(...x));

  const addMeasurement = db.prepare(`INSERT INTO patient_measurements
    (patient_id,date,weight,height) VALUES (?,?,?,?)`);
  [
    [1,"2026-01-10",74,1.67],[1,"2026-04-15",71,1.67],[1,"2026-09-10",68,1.67],
    [2,"2026-02-03",88,1.78],[2,"2026-05-10",85,1.78],[2,"2026-09-05",83,1.78],
    [3,"2026-03-12",64,1.62],[3,"2026-06-18",63,1.62],[3,"2026-09-01",61,1.62]
  ].forEach(x => addMeasurement.run(...x));

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

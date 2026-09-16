import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../data/app.db");

export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON;");

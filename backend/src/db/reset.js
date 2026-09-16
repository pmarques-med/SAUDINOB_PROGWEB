import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../data/app.db");

if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

console.log("Base de dados removida. Execute npm run dev para a recriar.");

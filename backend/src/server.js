import "dotenv/config";
import app from "./app.js";
import {initDatabase} from "./db/init.js";
const PORT=process.env.PORT || 3000;
initDatabase();
app.listen(PORT,()=>console.log(`API disponível em http://localhost:${PORT}`));

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import {errorHandler} from "./middleware/errorHandler.js";

const app=express();
app.use(cors({origin:process.env.FRONTEND_ORIGIN || true}));
app.use(express.json());
app.get("/api/health",(req,res)=>res.json({status:"ok"}));
app.use("/api/auth",authRoutes);
app.use("/api/patients",patientRoutes);
app.use("/api/doctors",doctorRoutes);
app.use("/api/alerts",alertRoutes);
app.use((req,res)=>res.status(404).json({error:"Endpoint not found"}));
app.use(errorHandler);
export default app;

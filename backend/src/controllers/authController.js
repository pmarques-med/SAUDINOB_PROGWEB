import { login } from "../services/authService.js";
export function loginController(req,res,next) {
  try {
    const {email,password}=req.body;
    if (!email || !password) return res.status(400).json({error:"Email and password are required"});
    const result=login(email,password);
    if (!result) return res.status(401).json({error:"Invalid credentials"});
    res.json(result);
  } catch(e){ next(e); }
}

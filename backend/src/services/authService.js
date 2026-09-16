import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/database.js";

export function login(email,password) {
  const user=db.prepare(
    "SELECT id,name,email,password_hash,role FROM users WHERE email=?"
  ).get(email);
  if (!user || !bcrypt.compareSync(password,user.password_hash)) return null;

  const token=jwt.sign(
    {sub:user.id,name:user.name,role:user.role},
    process.env.JWT_SECRET || "change-this-in-development",
    {expiresIn:"2h"}
  );
  return {token,user:{id:user.id,name:user.name,email:user.email,role:user.role}};
}

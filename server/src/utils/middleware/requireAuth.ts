import { Request, Response, NextFunction } from "express";
import { sbAdmin } from "../lib/supabse";


export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ ok: false, error: "Missing Authorization header" });

    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await sbAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ ok: false, error: "Invalid or expired token" });
    }

    (req as any).user = data.user;
    next();
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Auth error" });
  }
}

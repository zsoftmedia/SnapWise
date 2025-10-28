import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ ok: false, error: "Unauthorized: missing token" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify Supabase token
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ ok: false, error: "Unauthorized: invalid token" });
    }

    // ✅ Attach user to request
    (req as any).user = data.user;
    next();
  } catch (err: any) {
    console.error("requireAuth failed:", err.message);
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
}

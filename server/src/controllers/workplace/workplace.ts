import type { Request, Response } from "express";
import { insertWorkplace, getWorkplacesByUser } from "../../models/workplace/workplace";

export async function createWorkplace(req: Request, res: Response) {
  try {
    const { name, slug, createdBy } = req.body;

    if (!name || !slug || !createdBy) {
      return res.status(400).json({ ok: false, error: "Missing required fields." });
    }

    const workplace = await insertWorkplace({ name, slug, createdBy });
    res.json({ ok: true, workplace });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
}

export async function listUserWorkplaces(req: Request, res: Response) {
  const userId = String(req.query.userId || "");

  if (!userId || userId === "null" || userId === "undefined") {
    return res.status(400).json({ ok: false, error: "Missing or invalid userId." });
  }
  
  try {
    const workplaces = await getWorkplacesByUser(userId);
    return res.json({ ok: true, workplaces });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}


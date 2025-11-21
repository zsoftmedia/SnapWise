import { Request, Response } from "express";
import { sbAdmin } from "../../utils/lib/supabse";

export async function getRoles(req: Request, res: Response) {
  try {
    const { data, error } = await sbAdmin
      .from("roles")
      .select("*")
      .order("label", { ascending: true });

    if (error) throw error;

    res.json({ ok: true, roles: data });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

import type { Request, Response } from "express";

import { randomUUID } from "crypto";
import { sbAdmin } from "../../utils/lib/supabse";

/* ========= GET /api/profiles/me ========= */
export async function getMyProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const { data, error } = await sbAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return res.json({ ok: true, profile: data });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

/* ========= GET /api/profiles ========= */
export async function getAllProfiles(req: Request, res: Response) {
  try {
    // optionally restrict to admin:
    // if (req.user.role !== "admin") return res.status(403).json({ ok: false, error: "Forbidden" });

    const { data, error } = await sbAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ ok: true, profiles: data });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

/* ========= PUT /api/profiles/me ========= */
export async function updateMyProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const payload = req.body;

    const { data, error } = await sbAdmin
      .from("profiles")
      .update({
        full_name: payload.full_name,
        email: payload.email,
        avatar_url: payload.avatar_url,
        role: payload.role,
        workplace_id: payload.workplace_id,
        updated_at: new Date(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return res.json({ ok: true, profile: data });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

/* ========= DELETE /api/profiles/me ========= */
export async function deleteMyProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

    // deleting profile will also delete auth user due to CASCADE
    const { error } = await sbAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) throw error;

    return res.json({ ok: true, message: "Profile deleted" });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

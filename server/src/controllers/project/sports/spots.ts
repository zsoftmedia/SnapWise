import type { Request, Response } from "express";
import { z } from "zod";
import { sbAdmin } from "../../../utils/lib/supabse";
;

// Create a spot
const CreateSpotSchema = z.object({
  project_id: z.string().uuid(),
  area: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  label: z.string().min(1),
  plan_x: z.number().min(0).max(1).optional().nullable(),
  plan_y: z.number().min(0).max(1).optional().nullable(),
  orientation_deg: z.number().min(0).max(360).optional().nullable(),
  notes: z.string().optional().nullable(),
  created_by: z.string().min(1), // name or user id
});

export async function createSpot(req: Request, res: Response) {
  try {
    const body = CreateSpotSchema.parse(req.body);
    const { data, error } = await sbAdmin
      .from("project_photo_spots")
      .insert({
        project_id: body.project_id,
        area: body.area ?? null,
        floor: body.floor ?? null,
        room: body.room ?? null,
        label: body.label,
        plan_x: body.plan_x ?? null,
        plan_y: body.plan_y ?? null,
        orientation_deg: body.orientation_deg ?? null,
        notes: body.notes ?? null,
        created_by: body.created_by,
      })
      .select("id")
      .single();

    if (error) return res.status(500).json({ ok: false, error: "Failed to create spot" });
    return res.status(201).json({ ok: true, spot: { id: data!.id } });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message ?? "Invalid request" });
  }
}

// List spots for a project (optionally filter area/floor/room)
export async function listSpots(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const { area, floor, room } = req.query as Record<string, string | undefined>;
  let q = sbAdmin.from("project_photo_spots").select("*").eq("project_id", projectId);
  if (area) q = q.eq("area", area);
  if (floor) q = q.eq("floor", floor);
  if (room) q = q.eq("room", room);
  const { data, error } = await q.order("created_at", { ascending: false });

  if (error) return res.status(500).json({ ok: false, error: "Failed to fetch spots" });
  return res.json(data ?? []);
}

import type { Request, Response } from "express";
import { z } from "zod";
import { sbAdmin } from "../../../utils/lib/supabse";
import { env } from "../../../utils/env";


const UploadPhotoSchema = z.object({
  project_id: z.string().uuid(),
  spot_id: z.string().uuid(),
  image_data_url: z.string().min(20),     // data:image/...
  phase: z.enum(["before","after","other"]),
  status: z.enum(["not_started","in_progress","blocked","finished"]),
  description: z.string().optional().nullable(),
  employees_on_task: z.number().int().min(0).default(0),
  materials: z.array(z.string()).default([]),
  started_at: z.string().optional().nullable(),
  finished_at: z.string().optional().nullable(),
  duration_mins: z.number().int().min(0).default(0),
  location_tag: z.string().optional().nullable(),
  gps_lat: z.number().optional().nullable(),
  gps_lng: z.number().optional().nullable(),
  orientation_deg: z.number().optional().nullable(),
  // NEW grouping/time fields
  capture_group_id: z.string().uuid().optional(),
  captured_at: z.string().optional(),     // ISO timestamp
  captured_by_name: z.string().min(1),
});

function parseImageDataUrl(dataUrl: string): { contentType: string; buffer: Buffer; ext: string } {
  const m = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!m) throw new Error("Invalid data URL");
  const contentType = m[1]!;
  const buf = Buffer.from(m[2]!, "base64");
  const ext = ({
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif"
  } as Record<string,string>)[contentType] || "png";
  return { contentType, buffer: buf, ext };
}

export async function addPhotoToSpot(req: Request, res: Response) {
  try {
    const body = UploadPhotoSchema.parse(req.body);

    // 1) Upload to Storage
    const { contentType, buffer, ext } = parseImageDataUrl(body.image_data_url);
    const fileName = `${Date.now()}_${body.phase}.${ext}`;
    const objectPath = `${body.project_id}/spots/${body.spot_id}/${fileName}`;

    const { data: up, error: upErr } = await sbAdmin.storage
      .from(env.SUPABASE_BUCKET)
      .upload(objectPath, buffer, { contentType, upsert: true });
    if (upErr) return res.status(500).json({ ok: false, error: "Upload failed" });

    const { data: pub } = sbAdmin.storage.from(env.SUPABASE_BUCKET).getPublicUrl(up.path);
    const imageUrl = pub.publicUrl;

    // 2) Insert photo row
    const { data: row, error } = await sbAdmin
      .from("project_photos")
      .insert({
        project_id: body.project_id,
        spot_id: body.spot_id,
        image_url: imageUrl,
        thumb_url: null,

        phase: body.phase,
        status: body.status,
        description: body.description ?? null,

        employees_on_task: body.employees_on_task,
        materials: body.materials ?? [],

        started_at: body.started_at ?? null,
        finished_at: body.finished_at ?? null,
        duration_mins: body.duration_mins ?? 0,
        location_tag: body.location_tag ?? null,

        gps_lat: body.gps_lat ?? null,
        gps_lng: body.gps_lng ?? null,
        orientation_deg: body.orientation_deg ?? null,

        capture_group_id: body.capture_group_id ?? undefined,
        captured_at: body.captured_at ?? new Date().toISOString(),
        captured_by_name: body.captured_by_name,
      })
      .select("id, image_url, capture_group_id, captured_at")
      .single();

    if (error) return res.status(500).json({ ok: false, error: "Insert photo failed" });
    return res.status(201).json({ ok: true, photo: row });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err?.message ?? "Invalid request" });
  }
}

// List photos for a spot (optional phase filter)
export async function listPhotosBySpot(req: Request, res: Response) {
  const spotId = req.params.spotId;
  const phase = (req.query.phase as string | undefined) ?? undefined;
  let q = sbAdmin.from("project_photos").select("*").eq("spot_id", spotId);
  if (phase) q = q.eq("phase", phase);
  const { data, error } = await q.order("captured_at", { ascending: true });
  if (error) return res.status(500).json({ ok: false, error: "Failed to fetch photos" });
  return res.json(data ?? []);
}

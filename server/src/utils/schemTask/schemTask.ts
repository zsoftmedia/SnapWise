import { z } from "zod";

export const PhotoSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  dataUrl: z.string().optional().nullable(),
  mimeType: z.string().optional().nullable(),
  size: z.number().optional().nullable(),
  phase: z.enum(["before", "after", "other"]),
  status: z.enum(["not_started", "in_progress", "blocked", "finished"]),
  description: z.string().optional().nullable(),
  employeesOnTask: z.number(),
  materials: z.array(z.string()),
  startedAt: z.string().optional().nullable(),
  finishedAt: z.string().optional().nullable(),
  durationMins: z.number(),
  locationTag: z.string().optional().nullable(),
  capturedAt: z.string().optional().nullable(),
  captureGroupId: z.string().optional().nullable(),
  spot_id: z.string().optional().nullable(),
  pair_id: z.string().optional().nullable(),
});

export const CreateTaskDto = z.object({
  project_id: z.string(),
  project_readable_id: z.string(),
  project_name: z.string(),
  location: z.string(),
  area: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  work_package: z.string().optional().nullable(),
  supervisor: z.string().optional().nullable(),
  allow_gps: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  created_by: z.string().uuid().optional().nullable(), // ✅ Added userId
  created_by_name: z.string(),
  photos: z.array(PhotoSchema).min(1, "At least one photo is required"),
});

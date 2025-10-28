// server/src/utils/schemTask/schemTask.ts
import { z } from "zod";

export const TaskPhotoDto = z.object({
  id: z.string(),
  fileName: z.string(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  dataUrl: z.string().optional(),
  phase: z.enum(["before", "after", "other"]),
  status: z.enum(["not_started", "in_progress", "blocked", "finished"]),
  description: z.string().optional(),
  employeesOnTask: z.number(),
  materials: z.array(z.string()),
  startedAt: z.string().nullable().optional(),
  finishedAt: z.string().nullable().optional(),
  durationMins: z.number(),
  locationTag: z.string().nullable().optional(),
  capturedAt: z.string().optional(),
  captureGroupId: z.string().uuid().optional(),
  spot_id: z.string().uuid().nullable().optional(),

  // NEW: stable key to pair before/after of the same place
  pair_id: z.string().uuid().nullable().optional(),
});

export const CreateTaskDto = z.object({
  project_id: z.string().uuid(),
  project_readable_id: z.string(),
  project_name: z.string(),
  location: z.string(),
  area: z.string().nullable().optional(),
  floor: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
  work_package: z.string().nullable().optional(),
  supervisor: z.string().nullable().optional(),
  allow_gps: z.boolean(),
  notes: z.string().nullable().optional(),
  created_by_name: z.string().min(1),
  photos: z.array(TaskPhotoDto).min(1)
});

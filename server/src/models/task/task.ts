// server/src/models/task/task.ts
import { sbAdmin } from "../../utils/lib/supabse";

function dbError(message: string, cause?: unknown) {
  const err = new Error(message);
  (err as any).cause = cause;
  return err;
}

/* ============================================================
   INSERT TASK HEAD  (stores AUTH USER ID in created_by)
============================================================ */
export async function insertTaskHead(head: {
  projectId: string;
  projectReadableId: string;
  projectName: string;
  location: string;
  area: string | null;
  floor: string | null;
  room: string | null;
  workPackage: string | null;
  supervisor: string | null;
  allowGps: boolean;
  notes: string | null;
  createdBy: string | null;     // <-- auth user id
  createdByName: string;
}) {
  const { data, error } = await sbAdmin
    .from("project_tasks")
    .insert({
      project_id: head.projectId,
      project_readable_id: head.projectReadableId,
      project_name: head.projectName,
      location: head.location,
      area: head.area,
      floor: head.floor,
      room: head.room,
      work_package: head.workPackage,
      supervisor: head.supervisor,
      allow_gps: head.allowGps,
      notes: head.notes,
      created_by: head.createdBy,        // 🔥 store AUTH USER ID
      created_by_name: head.createdByName,
    })
    .select("id")
    .single();

  if (error) throw dbError("Failed to insert task", error);
  return data!.id as string;
}

/* ============================================================
   INSERT TASK PHOTOS
============================================================ */
export async function insertTaskPhotos(
  taskId: string,
  photos: Array<{
    photoClientId: string;
    fileName: string;
    url: string | null;
    mimeType?: string | null;
    size?: number | null;
    phase: "before" | "after" | "other";
    status: "not_started" | "in_progress" | "blocked" | "finished";
    description?: string | null;
    employeesOnTask: number;
    materials: string[];
    startedAt?: string | null;
    finishedAt?: string | null;
    durationMins: number;
    locationTag?: string | null;
    capturedAt: string;
    captureGroupId: string;
    spot_id?: string | null;
    pair_id?: string | null;
  }>
) {
  const rows = photos.map((p) => ({
    task_id: taskId,
    photo_client_id: p.photoClientId,
    file_name: p.fileName,
    url: p.url,
    mime_type: p.mimeType ?? null,
    size_bytes: p.size ?? null,
    phase: p.phase,
    status: p.status,
    description: p.description ?? null,
    employees_on_task: p.employeesOnTask,
    materials: p.materials,
    started_at: p.startedAt ?? null,
    finished_at: p.finishedAt ?? null,
    duration_mins: p.durationMins,
    location_tag: p.locationTag ?? null,
    captured_at: p.capturedAt,
    capture_group_id: p.captureGroupId,
    spot_id: p.spot_id ?? null,
    pair_id: p.pair_id ?? null,
  }));

  const { error } = await sbAdmin.from("project_task_photos").insert(rows);
  if (error) throw dbError("Failed to insert task photos", error);
}

/* ============================================================
   GET TASK + PHOTOS
============================================================ */
export async function getTaskWithPhotos(taskId: string) {
  const { data: task, error: e1 } = await sbAdmin
    .from("project_tasks")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();

  if (e1) throw dbError("Failed to load task", e1);

  const { data: photos, error: e2 } = await sbAdmin
    .from("project_task_photos")
    .select("*")
    .eq("task_id", taskId)
    .order("captured_at", { ascending: true });

  if (e2) throw dbError("Failed to load task photos", e2);

  return {
    task,
    photos: photos ?? [],
  };
}

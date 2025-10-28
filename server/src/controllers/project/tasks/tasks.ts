// server/src/controllers/project/tasks/tasks.ts
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { CreateTaskDto } from "../../../utils/schemTask/schemTask";
import { getTaskWithPhotos, insertTaskHead, insertTaskPhotos, listTasksForProject } from "../../../models/task/task";
import { sbAdmin } from "../../../utils/lib/supabse";

export async function createTask(req: Request, res: Response) {
  try {
    const parsed = CreateTaskDto.parse(req.body);

    // head
    const taskId = await insertTaskHead({
      projectId: parsed.project_id,
      projectReadableId: parsed.project_readable_id,
      projectName: parsed.project_name,
      location: parsed.location,
      area: parsed.area ?? null,
      floor: parsed.floor ?? null,
      room: parsed.room ?? null,
      workPackage: parsed.work_package ?? null,
      supervisor: parsed.supervisor ?? null,
      allowGps: parsed.allow_gps ?? false,
      notes: parsed.notes ?? null,
      createdByName: parsed.created_by_name
    });

    // remember last BEFORE pair per place key
    const lastBeforeByKey = new Map<string, string>();

    const rows = parsed.photos.map((p) => {
      const placeKey = (p.spot_id || p.locationTag || "no_loc").toString();

      let pairId = p.pair_id ?? null;
      if (p.phase === "before" && !pairId) {
        pairId = randomUUID();
        lastBeforeByKey.set(placeKey, pairId);
      }
      if (p.phase === "after" && !pairId) {
        pairId = lastBeforeByKey.get(placeKey) ?? randomUUID();
      }

      return {
        photoClientId: p.id,
        fileName: p.fileName,
        url: p.dataUrl ?? null, // store base64 for now (or swap to storage_url)
        mimeType: p.mimeType ?? null,
        size: p.size ?? null,
        phase: p.phase,
        status: p.status,
        description: p.description ?? null,
        employeesOnTask: p.employeesOnTask,
        materials: p.materials,
        startedAt: p.startedAt ?? null,
        finishedAt: p.finishedAt ?? null,
        durationMins: p.durationMins,
        locationTag: p.locationTag ?? null,
        capturedAt: p.capturedAt ?? new Date().toISOString(),
        captureGroupId: p.captureGroupId ?? randomUUID(),
        spot_id: p.spot_id ?? null,
        pair_id: pairId ?? null
      };
    });

    await insertTaskPhotos(taskId, rows);
    return res.status(201).json({ ok: true, task: { id: taskId, photos: rows.length } });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ ok: false, error: "Bad Request", details: err.errors });
    }
    console.error("createTask failed:", err);
    return res.status(500).json({ ok: false, error: err?.message ?? "Internal error" });
  }
}

export async function listProjectTasks(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const userId = req.query.userId as string;

    const { data, error } = await sbAdmin
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .eq("created_by", userId) // ✅ only this user’s tasks
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.json(data ?? []);
  } catch (err: any) {
    console.error("listProjectTasks:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}


export async function getTask(req: Request, res: Response) {
  try {
    const taskId = req.params.taskId;
    const data = await getTaskWithPhotos(taskId);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message ?? "Internal error" });
  }
}

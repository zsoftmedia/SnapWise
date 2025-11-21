// server/src/controllers/project/tasks/tasks.ts
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import {
  getTaskWithPhotos,
  insertTaskHead,
  insertTaskPhotos,
} from "../../../models/task/task";
import { sbAdmin } from "../../../utils/lib/supabse";
import { getWorkplacesByUser } from "../../../models/workplace/workplace";

/* ============================================================
   CREATE TASK
============================================================ */
export async function createTask(req: Request, res: Response) {
  try {
    const body = req.body;
    const user = (req as any).user;

    if (!user?.id) {
      return res.status(400).json({ ok: false, error: "Missing authenticated user" });
    }

    const taskId = await insertTaskHead({
      projectId: body.project_id,
      projectReadableId: body.project_readable_id,
      projectName: body.project_name,
      location: body.location,
      area: body.area ?? null,
      floor: body.floor ?? null,
      room: body.room ?? null,
      workPackage: body.work_package ?? null,
      supervisor: body.supervisor ?? null,
      allowGps: body.allow_gps ?? false,
      notes: body.notes ?? null,
      createdBy: user.id, // 🔥 STORE AUTH USER ID
      createdByName: body.created_by_name,
    });

    // Build photo rows
    const rows = body.photos.map((p: any) => ({
      photoClientId: p.id,
      fileName: p.fileName,
      url: p.dataUrl ?? null,
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
      pair_id: p.pair_id ?? null,
    }));

    await insertTaskPhotos(taskId, rows);

    return res
      .status(201)
      .json({ ok: true, task: { id: taskId, photos: rows.length } });

  } catch (err: any) {
    console.error("createTask ERROR:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message ?? "Internal error",
    });
  }
}

/* ============================================================
   LIST PROJECT TASKS
============================================================ */
/** LIST TASKS **/
export async function listProjectTasks(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const projectId = req.params.projectId;

    if (!user?.id || !projectId) {
      return res.status(400).json({
        ok: false,
        error: "Missing user or projectId",
      });
    }

    /* ------------------------------------------------------
       1️⃣ Get user profile (NOT employees anymore)
    ------------------------------------------------------ */
    const { data: profile, error: pErr } = await sbAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (pErr) throw pErr;

    if (!profile) {
      return res.status(403).json({
        ok: false,
        error: "Profile not found",
      });
    }

    const role = profile.role ?? "member";

    /* ------------------------------------------------------
       2️⃣ OWNER, ADMIN, SUPERVISOR → FULL ACCESS
    ------------------------------------------------------ */
    if (["owner", "admin", "supervisor"].includes(role)) {
      const { data, error } = await sbAdmin
        .from("project_tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    /* ------------------------------------------------------
       3️⃣ MEMBER → MUST check project_access table
          project_access.employee_id = auth.user.id now
    ------------------------------------------------------ */
    const { data: accessRow, error: aErr } = await sbAdmin
      .from("project_access")
      .select("project_id, can_view")
      .eq("employee_id", user.id)
      .eq("project_id", projectId)
      .maybeSingle();

    if (aErr) throw aErr;

    const hasAccess = accessRow?.can_view === true;

    /* ------------------------------------------------------
       4️⃣ MEMBER RULE:
          - If has access → show all tasks of this project
          - If NO access → show only tasks CREATED BY THEM
    ------------------------------------------------------ */

    if (hasAccess) {
      const { data, error } = await sbAdmin
        .from("project_tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    // Only self-created tasks
    const { data, error } = await sbAdmin
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json(data || []);

  } catch (err: any) {
    console.error("listProjectTasks ERROR:", err);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}



/* ============================================================
   GET SINGLE TASK WITH PHOTOS
============================================================ */
export async function getTask(req: Request, res: Response) {
  try {
    const taskId = req.params.taskId;
    const data = await getTaskWithPhotos(taskId);
    return res.json(data);
  } catch (err: any) {
    console.error("getTask ERROR:", err);
    return res.status(500).json({ ok: false, error: err?.message });
  }
}

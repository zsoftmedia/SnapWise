import type { Request, Response } from "express";
import { deleteProjectAccess, getAccessForEmployee, insertProjectAccess, updateProjectAccess } from "../../../models/projectAccess/projectAccess";

export async function createAccess(req: Request, res: Response) {
  try {
    const payload = req.body;

    if (!payload.employee_id || !payload.project_id) {
      return res.status(400).json({ ok: false, error: "Missing employee_id or project_id" });
    }

    const access = await insertProjectAccess({
      employee_id: payload.employee_id,
      project_id: payload.project_id,
      can_view: payload.can_view ?? true,
      can_edit: payload.can_edit ?? false,
      can_manage_tasks: payload.can_manage_tasks ?? true,
      can_manage_team: payload.can_manage_team ?? true,
    });

    res.json({ ok: true, access });
  } catch (err: any) {
    console.error("createAccess error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
}

export async function getEmployeeAccess(req: Request, res: Response) {
  try {
    const { employeeId } = req.params;
    const rows = await getAccessForEmployee(employeeId);
    res.json({ ok: true, access: rows });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updateAccess(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const updated = await updateProjectAccess(id, req.body);
    res.json({ ok: true, access: updated });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deleteAccess(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await deleteProjectAccess(id);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

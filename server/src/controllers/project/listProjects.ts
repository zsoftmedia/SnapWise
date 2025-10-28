import type { Request, Response } from "express";
import { sbAdmin } from "../../utils/lib/supabse";

/* ========= GET /api/projects ========= */
export async function listProjects(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user?.id) {
      return res
        .status(401)
        .json({ ok: false, error: "Unauthorized: missing user ID" });
    }

    const userId = user.id;

    const { data, error } = await sbAdmin
      .from("new_projects")
      .select(
        "id, name, location, project_id, start_date, end_date, supervisor, work_type, plan_image_url, created_at"
      )
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("listProjects: select failed:", error);
      return res.status(500).json({ ok: false, error: "Failed to fetch projects" });
    }

    return res.status(200).json({ ok: true, data: data ?? [] });
  } catch (err: any) {
    console.error("listProjects failed:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? "Internal server error" });
  }
}

/* ========= GET /api/projects/:id/team ========= */
export async function listProjectTeam(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user?.id) {
      return res
        .status(401)
        .json({ ok: false, error: "Unauthorized: missing user ID" });
    }

    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).json({ ok: false, error: "Missing project ID" });
    }

    const { data, error } = await sbAdmin
      .from("project_team_members")
      .select(
        "id, full_name, avatar_url, phone, email, user_id_external"
      )
      .eq("project_id", projectId)
      .order("full_name", { ascending: true });

    if (error) {
      console.error("listProjectTeam failed:", error);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to fetch team" });
    }

    return res.status(200).json({ ok: true, data: data ?? [] });
  } catch (err: any) {
    console.error("listProjectTeam unexpected:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? "Internal server error" });
  }
}

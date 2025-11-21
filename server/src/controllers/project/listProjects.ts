import type { Request, Response } from "express";
import { insertProject, insertTeamMembers } from "../../models/projects/project"; // Assumes model is correctly defined
import { sbAdmin } from "../../utils/lib/supabse";
import { getWorkplacesByUser } from "../../models/workplace/workplace";
import { ProfileModel } from "../../models/userProfile/userProfile";
import { log } from "node:console";

/* ============================================================
   POST /api/projects - Stores workplace_id
============================================================ */
export async function createProject(req: Request, res: Response) {
  try {
    console.log(req.body)
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized: missing user ID",
      });
    }
 
    const body = req.body;
    // Check for workplace_id explicitly
    if (!body.workplace_id) { 
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: name, location, projectId, or workplace_id",
      });
    }

    const planImageUrl = body.planImageDataUrl ?? null;

    // ✅ Insert project - workplace_id is passed to the model
    const { id: projectRowId } = await insertProject({
      createdBy: user.id,
      name: body.name,
      location: body.location,
      projectId: body.projectId,
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      supervisor: body.supervisor ?? null,
      workType: body.workType ?? null,
      notes: body.notes ?? null,
      planImageUrl,
      allowGps: body.allowGps ?? false,
      clientName: body.clientName ?? null,
      budgetEUR: body.budgetEUR ?? null,
      workplace_id: body.workplace_id, // CRITICAL: This ensures storage
    });

    // ✅ Insert team members (using provided role)
    if (Array.isArray(body.teamMembers) && body.teamMembers.length > 0) {
      const teamRecords = body.teamMembers.map((m: any) => ({
        projectRowId,
        createdBy: user.id,
        fullName: m.fullName,
        avatarUrl: m.avatarUrl ?? null,
        phone: m.phone ?? null,
        email: m.email ?? null,
        userIdExternal: m.userId ?? null,
        role: m.role ?? "member", 
       
      }));

      await insertTeamMembers(teamRecords);
    }

    return res.status(201).json({
      ok: true,
      project: {
        id: projectRowId,
        plan_image_url: planImageUrl,
      },
    });
  } catch (err: any) {
    console.error("❌ createProject failed:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message ?? "Internal server error",
    });
  }
}

/* ============================================================
   GET /api/projects - FIX: Filter by Workplace ID
============================================================ */
export async function listProjects(req: Request, res: Response) {
  try {
    const authUser = (req as any).user;

    if (!authUser?.id) {
      return res.status(401).json({ ok: false, error: "Missing user" });
    }

    const userId = authUser.id;

    /* ------------------------------------------------------
     * 1️⃣ Load profile → SOURCE OF TRUTH for role & workplace
     * ------------------------------------------------------ */
    const { data: profile, error: pErr } = await sbAdmin
      .from("profiles")
      .select("role, workplace_id")
      .eq("id", userId)
      .single();

    if (pErr || !profile) throw pErr || new Error("Profile missing");

    const role = profile.role || "member";
    const workplaceId = profile.workplace_id;
 console.log(role)
    if (!workplaceId) {
      return res.status(400).json({
        ok: false,
        error: "User has no workplace assigned",
      });
    }

    /* ------------------------------------------------------
     * 2️⃣ OWNER / ADMIN / SUPERVISOR → full access to workplace
     * ------------------------------------------------------ */
    if (["owner", "admin", "supervisor"].includes(role)) {
      const { data, error } = await sbAdmin
        .from("new_projects")
        .select("*")
        .eq("workplace_id", workplaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
console.log(data)
      return res.json({ ok: true, projects: data });
    }

    /* ------------------------------------------------------
     * 3️⃣ MEMBER → only assigned projects via project_access
     *    ⚠ employee_id now stores AUTH.USER ID, NOT employee row
     * ------------------------------------------------------ */
    const { data: accessRows, error: paErr } = await sbAdmin
      .from("project_access")
      .select(`
        project_id,
        new_projects(*)
      `)
      .eq("employee_id", userId) // 🔥 NEW FIX
      .eq("can_view", true);

    if (paErr) throw paErr;

    const projects = accessRows.map((p) => p.new_projects);

    return res.json({ ok: true, projects });

  } catch (err: any) {
    console.error("❌ listProjects failed:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}



/* ============================================================
   GET /api/projects/:id/team (Unchanged)
============================================================ */
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
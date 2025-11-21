import type { Request, Response } from "express";
import { insertProject, insertTeamMembers } from "../../models/projects/project";
import { console } from "inspector";

 async function createProject(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized: missing user ID",
      });
    }

    const body = req.body;
    if (!body.name || !body.location || !body.projectId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: name, location, or projectId",
      });
    }

    const planImageUrl = body.planImageDataUrl ?? null;

    // ✅ Insert project (workplace_id is correctly passed here)
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
      workplace_id:body.workplace_id, // Safely stores workplace ID
    });
console.log("body.workplace_id",body.workplace_id)
    
    // ✅ Insert team members (m.role will use the passed role from the frontend)
    if (Array.isArray(body.teamMembers) && body.teamMembers.length > 0) {
      const teamRecords = body.teamMembers.map((m: any) => ({
        projectRowId,
        createdBy: user.id,
        fullName: m.fullName,
        avatarUrl: m.avatarUrl ?? null,
        phone: m.phone ?? null,
        email: m.email ?? null,
        userIdExternal: m.userId ?? null,
        role: m.role ?? "member", // Uses the role passed from the frontend (or defaults)
        status: m.status ?? "active",
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
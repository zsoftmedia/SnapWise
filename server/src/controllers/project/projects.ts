import type { Request, Response } from "express";
import { CreateProjectDto } from "../../utils/schemProject";
import { insertProject, insertTeamMembers } from "../../models/projects/project";

export async function createProject(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ ok: false, error: "Unauthorized: missing user ID" });
    }

    const parsed = CreateProjectDto.parse(req.body);
    const planImageUrl = parsed.planImageDataUrl || null;

    const { id: projectRowId } = await insertProject({
      createdBy: user.id, // ✅ use Supabase user.id
      name: parsed.name,
      location: parsed.location,
      projectId: parsed.projectId,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      supervisor: parsed.supervisor,
      workType: parsed.workType,
      notes: parsed.notes,
      planImageUrl,
      allowGps: parsed.allowGps ?? false,
      clientName: parsed.clientName,
      budgetEUR: parsed.budgetEUR,
    });

    if (parsed.teamMembers?.length) {
      await insertTeamMembers(
        parsed.teamMembers.map((m) => ({
          projectRowId,
          createdBy: user.id,
          fullName: m.fullName,
          avatarUrl: m.avatarUrl ?? null,
          phone: m.phone ?? null,
          email: m.email ?? null,
          userIdExternal: m.userId ?? null,
        }))
      );
    }

    return res.status(201).json({
      ok: true,
      project: { id: projectRowId, plan_image_url: planImageUrl },
    });
  } catch (err: any) {
    console.error("createProject failed:", err?.message);
    return res.status(500).json({ ok: false, error: err?.message ?? "Internal error" });
  }
}

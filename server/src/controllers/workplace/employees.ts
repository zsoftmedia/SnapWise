import type { Request, Response } from "express";
import { activateEmployee, getEmployeeByToken, insertEmployeeInvite, listWorkplaceEmployees } from "../../models/workplace/employees";
import { randomUUID } from "crypto";
import { sbAdmin } from "../../utils/lib/supabse";


// ✅ Invite a new employee
export async function generateInviteLink(req: Request, res: Response) {
  try {
    const { workplace_id, full_name, email, invited_by, role = "member" } = req.body;

    if (!workplace_id || !email) {
      throw new Error("Missing required fields");
    }

    const invite_token = randomUUID();

    const { data, error } = await sbAdmin
      .from("employees")
      .insert([
        {
          workplace_id,
          full_name,
          email,
          invited_by,
          role,
          invite_token,
          status: "invited",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const inviteUrl = `${process.env.APP_ORIGIN || "http://localhost:3000"}/join-workplace?token=${invite_token}`;

    res.json({ ok: true, inviteUrl, employee: data });
  } catch (err: any) {
    console.error("❌ Error generating invite:", err);
    res.status(400).json({ ok: false, error: err.message });
  }
}
// ✅ Verify an invitation token
export async function verifyEmployeeInvite(req: Request, res: Response) {
  try {
    const token = req.params.token;
    const invite = await getEmployeeByToken(token);
    if (!invite) return res.status(404).json({ ok: false, error: "Invalid or expired invite" });
    res.json({ ok: true, invite });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

// ✅ Accept an invite (activate employee)
export async function acceptEmployeeInvite(req: Request, res: Response) {
  try {
    const { token, user_id } = req.body;
    const employee = await activateEmployee(token, user_id);
    res.json({ ok: true, employee });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

// ✅ Get all employees for a workplace
export async function getEmployees(req: Request, res: Response) {
  try {
    const { workplaceId } = req.params;
    const employees = await listWorkplaceEmployees(workplaceId);
    res.json({ ok: true, employees });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

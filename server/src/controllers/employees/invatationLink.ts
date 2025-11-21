import { Request, Response } from "express";
import { sbAdmin } from "../../utils/lib/supabse";

// ------------------------------------------
// STEP 1 — Validate invitation link
// ------------------------------------------
export async function checkInvite(req: Request, res: Response) {
  try {
    const { token } = req.params;

    const { data, error } = await sbAdmin
      .from("employees")
      .select("id, full_name, email")
      .eq("invite_token", token)    // IMPORTANT — must match column
      .single();

    if (error || !data) {
      return res.status(404).json({ ok: false, error: "Invalid or expired link" });
    }

    return res.json({ ok: true, employee: data });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// ------------------------------------------
// STEP 2 — Complete registration
// ------------------------------------------
export async function completeInvite(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ ok: false, error: "Missing token or password" });
    }

    // Find employee
    const { data: emp, error } = await sbAdmin
      .from("employees")
      .select("*")
      .eq("invite_token", token)
      .single();

    if (error || !emp) {
      return res.status(404).json({ ok: false, error: "Invalid or expired link" });
    }

    // Create user in Supabase Auth
    const { data: authUser, error: createError } = await sbAdmin.auth.admin.createUser({
      email: emp.email,
      password,
      email_confirm: true,
    });

    if (createError) throw createError;

    // Update employee
    await sbAdmin
      .from("employees")
      .update({
        user_id: authUser.user.id,
        status: "active",
        invite_token: null,
      })
      .eq("id", emp.id);

    return res.json({ ok: true, message: "Account created", user: authUser.user });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

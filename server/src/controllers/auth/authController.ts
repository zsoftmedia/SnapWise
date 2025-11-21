import { Request, Response } from "express";
import { sbAdmin } from "../../utils/lib/supabse";
import { ProfileModel } from "../../models/userProfile/userProfile";
import { createClient } from "@supabase/supabase-js";
import { env } from "../../utils/env";

// Admin client
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const redirectTo = `${process.env.CLIENT_ORIGIN || "http://localhost:4000"}/auth/callback`;

export const AuthController = {

  /* ============================================================
   * SIGNUP — OWNER ACCOUNT
   * ============================================================ */
  signup: async (req: Request, res: Response) => {
    try {
      const { email, password, fullName, workplaceName, workplaceSlug } = req.body;

      // 1. Create auth user
      const { data: userData, error: authError } = await sbAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          full_name: fullName ?? "",
          role: "owner", // will be finalized later
          workplace_id: null,
          invited_employee_id: null,
        },
      });

      if (authError) return res.status(400).json({ error: authError.message });

      const userId = userData.user!.id;

      // 2. Create Workplace
      const slug =
        workplaceSlug ||
        fullName?.toLowerCase().replace(/\s+/g, "-") ||
        `workplace-${userId.substring(0, 8)}`;

      const { data: workplace, error: wpError } = await sbAdmin
        .from("workplaces")
        .insert({
          name: workplaceName || `${fullName}'s Workplace`,
          slug,
          created_by: userId,
        })
        .select("id")
        .single();

      if (wpError || !workplace) throw wpError;
      const workplaceId = workplace.id;

      // 3. Create employee row for OWNER
      const { data: employee, error: empError } = await sbAdmin
        .from("employees")
        .insert({
          workplace_id: workplaceId,
          full_name: fullName,
          email,
          role: "owner",
          user_id: userId,
          invited_by: userId,
          status: "active",
          grant_access: true,
        })
        .select("id, role")
        .single();

      if (empError || !employee) throw empError;

      // 4. Update auth metadata
      const { error: metaErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: fullName,
          role: employee.role,
          workplace_id: workplaceId,
          invited_employee_id: employee.id,
        },
      });

      if (metaErr) throw metaErr;

      // 5. Send confirmation email
      await sbAdmin.auth.admin.inviteUserByEmail(email, { redirectTo });

      const { data } = useGetWorkplacesByUserQuery(userId!);
      console.log(data)
      // 6. Create profile
      await ProfileModel.upsert({
        id: userId,
        email,
        full_name: fullName,
        role: "owner",
        workplace_id: data.id,
        avatar_url: null,
      });

      return res.status(201).json({
        ok: true,
        userId,
        workplace_id: workplaceId,
        role: employee.role,
        message: "Account created. Please confirm your email.",
      });

    } catch (e: any) {
      console.error("signup error:", e);
      return res.status(500).json({ error: e.message || "Internal server error" });
    }
  },

  /* ============================================================
   * LOGIN
   * ============================================================ */
  login: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const { data: list } = await sbAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

      if (!user) return res.status(400).json({ error: "Invalid credentials." });

      if (!user.email_confirmed_at)
        return res.status(403).json({ error: "Please confirm your email." });

      return res.json({ ok: true });

    } catch (e: any) {
      console.error("login error:", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  /* ============================================================
   * RESEND CONFIRMATION
   * ============================================================ */
  resend: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const { data: list } = await sbAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

      if (!user) return res.json({ message: "If exists, email will be sent." });
      if (user.email_confirmed_at) return res.json({ message: "Email already confirmed." });

      await sbAdmin.auth.admin.inviteUserByEmail(email, { redirectTo });

      return res.json({ message: "Confirmation email resent." });

    } catch (e: any) {
      console.error("resend error:", e);
      return res.status(500).json({ error: "Internal error" });
    }
  },

  /* ============================================================
   * ME — Current User + Profile
   * ============================================================ */
  me: async (req: Request, res: Response) => {
    try {
      const userId = String(req.header("x-user-id") || "");
      if (!userId) return res.status(401).json({ error: "Missing user id" });

      const { data: userRes, error } = await sbAdmin.auth.admin.getUserById(userId);
      if (error || !userRes.user) return res.status(404).json({ error: "User not found." });

      const profile = await ProfileModel.getById(userId);

      return res.json({
        user: userRes.user,
        profile: profile ?? null,
      });

    } catch (e: any) {
      console.error("me error:", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  /* ============================================================
   * VERIFY INVITE TOKEN
   * ============================================================ */
  verifyInviteToken: async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      const { data: emp, error } = await sbAdmin
        .from("employees")
        .select("*")
        .eq("invite_token", token)
        .single();

      if (error || !emp)
        return res.status(404).json({ ok: false, error: "Invalid or expired link." });

      return res.json({ ok: true, employee: emp });

    } catch (e: any) {
      console.error("verifyInviteToken error:", e);
      return res.status(500).json({ ok: false, error: "Internal server error" });
    }
  },

  /* ============================================================
   * COMPLETE INVITE
   * ============================================================ */
  completeInvite: async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      // 1. Load employee invitation
      const { data: emp, error: empErr } = await sbAdmin
        .from("employees")
        .select("*")
        .eq("invite_token", token)
        .single();

      if (empErr || !emp)
        return res.status(404).json({ ok: false, error: "Invalid token" });

      // 2. Create auth user
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: emp.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: emp.full_name,
          invited_employee_id: emp.id,
          workplace_id: emp.workplace_id,
          role: emp.role,
        },
      });

      if (createErr)
        return res.status(400).json({ ok: false, error: createErr.message });

      const authId = newUser.user.id;

      // 3. Update employees row → link auth user
      await sbAdmin
        .from("employees")
        .update({
          user_id: authId,
          invite_token: null,
          status: "active",
        })
        .eq("id", emp.id);

      // 4. Create profile
      await ProfileModel.upsert({
        id: authId,
        email: emp.email,
        full_name: emp.full_name,
        role: emp.role,
        workplace_id: emp.workplace_id,
        avatar_url: null,
      });

      return res.json({
        ok: true,
        message: "Account created successfully.",
        workplace_id: emp.workplace_id,
        role: emp.role,
        invited_employee_id: emp.id,
      });

    } catch (e: any) {
      console.error("completeInvite error:", e);
      return res.status(500).json({ ok: false, error: "Internal server error" });
    }
  },
};
function useGetWorkplacesByUserQuery(arg0: string): { data: any; } {
  throw new Error("Function not implemented.");
}


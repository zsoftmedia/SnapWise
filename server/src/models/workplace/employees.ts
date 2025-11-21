import crypto from "crypto";
import { sbAdmin } from "../../utils/lib/supabse";

// ✅ Type definitions
export type EmployeeRole = "owner" | "admin" | "supervisor" | "member" | "viewer";
export type EmployeeStatus = "invited" | "active" | "suspended";

export interface EmployeeInviteInput {
  workplace_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_preview?: string | null;
  invited_by: string;
  role?: EmployeeRole;
}

// ✅ Insert a new invited employee
export async function insertEmployeeInvite({
  workplace_id,
  full_name,
  email,
  phone,
  avatar_preview,
  invited_by,
  role = "member",
}: EmployeeInviteInput) {
  const invite_token = crypto.randomUUID();

  const { data, error } = await sbAdmin
    .from("employees")
    .insert([
      {
        workplace_id,
        full_name,
        email,
        phone,
        avatar_preview,
        invited_by,
        role,
        invite_token,
        status: "invited",
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ✅ Verify invite by token
export async function getEmployeeByToken(token: string) {
  const { data, error } = await sbAdmin
    .from("employees")
    .select("*, workplaces(name)")
    .eq("invite_token", token)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ✅ Activate employee (after accepting invite)
export async function activateEmployee(token: string, user_id: string) {
  const { data, error } = await sbAdmin
    .from("employees")
    .update({
      user_id,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("invite_token", token)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ✅ List all employees for a workplace
export async function listWorkplaceEmployees(workplaceId: string) {
  const { data, error } = await sbAdmin
    .from("employees")
    .select("*")
    .eq("workplace_id", workplaceId);

  if (error) throw new Error(error.message);
  return data;
}

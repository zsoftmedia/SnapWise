// src/models/auth/inviteEmployeeModel.ts
import { sbAdmin } from "../../utils/lib/supabse";

export async function findEmployeeByToken(token: string) {
  const { data, error } = await sbAdmin
    .from("employees")
    .select("*")
    .eq("invite_token", token)
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function linkEmployeeToSupabaseUser(employeeId: string, userId: string) {
  const { error } = await sbAdmin
    .from("employees")
    .update({
      user_id_external: userId,
      status: "active",
    })
    .eq("id", employeeId);

  if (error) throw error;
}

export async function invalidateInviteToken(employeeId: string) {
  const { error } = await sbAdmin
    .from("employees")
    .update({ invite_token: null })
    .eq("id", employeeId);

  if (error) throw error;
}

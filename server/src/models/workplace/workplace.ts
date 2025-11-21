import { sbAdmin } from "../../utils/lib/supabse";
import { ProfileModel } from "../userProfile/userProfile";


/**
 * Insert a new workplace
 */
export async function insertWorkplace({
  name,
  slug,
  createdBy
}: {
  name: string;
  slug: string;
  createdBy: string; // <-- auth.users.id
}) {
  // 1. Create workplace
  const { data: workplace, error } = await sbAdmin
    .from("workplaces")
    .insert([{ name, slug, created_by: createdBy }])
    .select()
    .single();

  if (error) throw new Error(error.message);
const existing = await ProfileModel.getById(createdBy);
  // 2. Update profile.workplace_id for this user
  await ProfileModel.upsert({
    id: createdBy,
    email: existing?.email ?? null,
    full_name: existing?.full_name ?? null,
    role: existing?.role ?? null,
    avatar_url: existing?.avatar_url ?? null,
    workplace_id: workplace.id  // 🔥 only this changes
  });

  return workplace;
}

/**
 * Fetch all workplaces created by a specific user
 */
export async function getWorkplacesByUser(userId: string) {
  console.log("🔍 Resolving workplace(s) for user:", userId);

  /* -------------------------------------------------------------
   * 1️⃣ FIRST PRIORITY — WORKPLACES CREATED BY THIS USER (OWNER)
   * ------------------------------------------------------------- */
  const { data: owned, error: ownerErr } = await sbAdmin
    .from("workplaces")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (ownerErr) throw new Error(ownerErr.message);

  if (owned && owned.length > 0) {
    // User is owner of one or multiple workplaces
    return owned;
  }

  /* -------------------------------------------------------------
   * 2️⃣ SECOND — USER IS AN EMPLOYEE (CHECK employees TABLE)
   * ------------------------------------------------------------- */
  const { data: employeeRows, error: empErr } = await sbAdmin
    .from("employees")
    .select("workplace_id, status, role")
    .eq("user_id", userId)
    .eq("status", "active");         // 🔥 Only active employees

  if (empErr) throw new Error(empErr.message);

  if (!employeeRows || employeeRows.length === 0) {
    // User is NOT owner and NOT employee
    return [];
  }

  // Extract unique workplace IDs
  const workplaceIds = [...new Set(employeeRows.map(e => e.workplace_id))];

  /* -------------------------------------------------------------
   * 3️⃣ THIRD — Fetch all workplaces linked to those IDs
   * ------------------------------------------------------------- */
  const { data: workplaces, error: wpErr } = await sbAdmin
    .from("workplaces")
    .select("*")
    .in("id", workplaceIds);

  if (wpErr) throw new Error(wpErr.message);

  return workplaces || [];
}


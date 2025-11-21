import { sbAdmin } from "../../utils/lib/supabse";

export type Profile = {
  id: string;
  email: string | null;
  full_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  workplace_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export const ProfileModel = {
  /* -------------------------------------------------------
   * GET PROFILE BY AUTH USER ID
   * ------------------------------------------------------- */
  async getById(id: string): Promise<Profile | undefined> {
    const { data, error } = await sbAdmin
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle(); // cleaner than limit(1)

    if (error) throw error;
    return data ?? undefined;
  },

  /* -------------------------------------------------------
   * UPSERT PROFILE (INSERT OR UPDATE)
   * ------------------------------------------------------- */
  async upsert(profile: Partial<Profile>): Promise<Profile | undefined> {
    const payload: Partial<Profile> = {
      id: profile.id,
      email: profile.email ?? null,
      full_name: profile.full_name ?? null,
      role: profile.role ?? null,
      avatar_url: profile.avatar_url ?? null,
      workplace_id: profile.workplace_id ?? null,
    };

    const { data, error } = await sbAdmin
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data ?? undefined;
  },
};

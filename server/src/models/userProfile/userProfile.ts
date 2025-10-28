import { sbAdmin } from "../../utils/lib/supabse";


export type Profile = {
  id: string;
  email: string | null;
  full_name?: string | null;
  created_at?: string;
  updated_at?: string;
};

export const ProfileModel = {
  async getById(id: string) {
    const { data, error } = await sbAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .limit(1);
    if (error) throw error;
    return data?.[0] as Profile | undefined;
  },

  async upsert(profile: Partial<Profile>) {
    // Defensive: in case you ever call manually — uses ON CONFLICT
    const { data, error } = await sbAdmin
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .limit(1);
    if (error) throw error;
    return data?.[0] as Profile | undefined;
  }
};

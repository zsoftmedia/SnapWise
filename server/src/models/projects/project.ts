import { sbAdmin } from "../../utils/lib/supabse";


/** Domain error wrapper */
function dbError(message: string, cause?: unknown) {
  const err = new Error(message);
  // @ts-ignore
  err.cause = cause;
  return err;
}

/** Parse data URL to buffer */
function parseImageDataUrl(dataUrl: string): { contentType: string; buffer: Buffer } {
  const m = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!m) throw dbError("Invalid image data URL (expected data:<mime>;base64,...)");
  const [, contentType, b64] = m;
  return { contentType, buffer: Buffer.from(b64, "base64") };
}

export async function uploadPlanImageFromDataUrl(params: {
  userId: string;
  readableProjectId: string;
  dataUrl: string;
  bucket: string;
}): Promise<string> {
  const { userId, readableProjectId, dataUrl, bucket } = params;
  const { contentType, buffer } = parseImageDataUrl(dataUrl);

  const ext = (() => {
    const map: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/heic": "heic",
      "image/heif": "heif",
      "image/svg+xml": "svg"
    };
    return map[contentType] || "png";
  })();

  const fileName = `plan-${Date.now()}.${ext}`;
  const objectPath = `${userId}/${readableProjectId}/${fileName}`;

  const { data, error } = await sbAdmin.storage
    .from(bucket)
    .upload(objectPath, buffer, { contentType, upsert: true });

  if (error) throw dbError("Failed to upload plan image", error);

  const { data: pub } = sbAdmin.storage.from(bucket).getPublicUrl(data.path);
  return pub.publicUrl;
}

export type InsertProjectArgs = {
  createdBy: string;
  name: string;
  location: string;
  projectId: string;
  startDate?: string;
  endDate?: string;
  supervisor?: string;
  workType?: string;
  notes?: string;
  planImageUrl?: string | null;
  allowGps: boolean;
  clientName?: string;
  budgetEUR?: number;
};

export async function insertProject(args: InsertProjectArgs): Promise<{ id: string }> {
  const { data, error } = await sbAdmin
    .from("new_projects")
    .insert({
      name: args.name,
      location: args.location,
      project_id: args.projectId,
      start_date: args.startDate ?? null,
      end_date: args.endDate ?? null,
      supervisor: args.supervisor ?? null,
      work_type: args.workType ?? null,
      notes: args.notes ?? null,
      plan_image_url: args.planImageUrl ?? null,
      allow_gps: !!args.allowGps,
      client_name: args.clientName ?? null,
      budget_eur: args.budgetEUR ?? null,
      created_by: args.createdBy
    })
    .select("id")
    .single();

  if (error) throw dbError("Failed to insert project", error);
  if (!data?.id) throw dbError("Insert succeeded but no project id returned");
  return { id: data.id as string };
}

export type InsertTeamMemberArgs = {
  projectRowId: string;
  createdBy: string;
  fullName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  userIdExternal?: string | null;
};

export async function insertTeamMembers(members: InsertTeamMemberArgs[]): Promise<void> {
  if (!members?.length) return;

  const rows = members.map((m) => ({
    project_id: m.projectRowId,
    full_name: m.fullName,
    avatar_url: m.avatarUrl ?? null,
    phone: m.phone ?? null,
    email: m.email ?? null,
    user_id_external: m.userIdExternal ?? null,
    created_by: m.createdBy
  }));

  const { error } = await sbAdmin.from("project_team_members").insert(rows);
  if (error) throw dbError("Failed to insert project team members", error);
}

import { Response, Request } from "express";
import { randomUUID } from "crypto";
import { sbAdmin } from "../../utils/lib/supabse";

// Extend Express Request to support Multer file
interface MulterRequest extends Request {
  file?: any;
}

// --------------------------------------------------
// CREATE EMPLOYEE
// --------------------------------------------------
export async function createEmployee(req: MulterRequest, res: Response) {
  try {
    const { workplace_id, full_name, email, phone, role, invited_by } = req.body;

    if (!workplace_id || !full_name || !email || !invited_by) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    let avatarUrl: string | null = null;

    // =======================
    //  Upload Avatar (optional)
    // =======================
    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `${Date.now()}_${randomUUID()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const uploadRes = await sbAdmin.storage
        .from("avatars")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadRes.error) throw uploadRes.error;

      avatarUrl = sbAdmin.storage
        .from("avatars")
        .getPublicUrl(filePath).data.publicUrl;
    }

    // =======================
    //   Create Employee
    // =======================
    const invite_token = randomUUID();

    const { data, error } = await sbAdmin
      .from("employees")
      .insert([
        {
          workplace_id,
          full_name,
          email,
          phone,
          role,
          invited_by,
          invite_token,
          avatar_url: avatarUrl,
          status: "invited",
        },
      ])
      .select(`
        id,
        workplace_id,
        full_name,
        email,
        phone,
        role,
        invited_by,
        invite_token,
        status,
        avatar_url
      `) // 👈 Return all needed columns
      .single();

    if (error) throw error;

    console.log("🟢 Employee created:", data);

    // =======================
    //  Create frontend + backend invite links
    // =======================
    const frontendJoinUrl = `${process.env.APP_URL}/join?token=${invite_token}`;
    const backendVerifyUrl = `http://localhost:4000/api/auth/invite/${invite_token}`;

    console.log("Frontend join link:", frontendJoinUrl);
    console.log("Backend verify link:", backendVerifyUrl);

    return res.json({
      ok: true,
      employee: data,
      join_link: frontendJoinUrl,
      verify_link: backendVerifyUrl,
      workplace_id: data.workplace_id,
      role: data.role,
      employee_id: data.id,
    });
  } catch (err: any) {
    console.error("❌ createEmployee:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}




// --------------------------------------------------
// FETCH EMPLOYEES
// --------------------------------------------------
export async function fetchEmployees(req: Request, res: Response) {
  try {
    const { workplace_id } = req.params;

    const { data, error } = await sbAdmin
      .from("employees")
      .select("*")
      .eq("workplace_id", workplace_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ ok: true, employees: data });
  } catch (err: any) {
    console.error("❌ fetchEmployees:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

// --------------------------------------------------
// UPDATE EMPLOYEE
// --------------------------------------------------
export async function updateEmployee(req: MulterRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates: any = req.body;

    // Optional avatar upload
    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `${Date.now()}_${randomUUID()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await sbAdmin.storage
        .from("avatars")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: "3600"
        });

      if (uploadError) throw uploadError;

      // FIXED getPublicUrl()
      const {
        data: { publicUrl }
      } = sbAdmin.storage.from("avatars").getPublicUrl(filePath);

      updates.avatar_url = publicUrl;
    }

    const { data, error } = await sbAdmin
      .from("employees")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ ok: true, employee: data });
  } catch (err: any) {
    console.error("❌ updateEmployee:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

// --------------------------------------------------
// DELETE EMPLOYEE
// --------------------------------------------------
export async function deleteEmployee(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data: employee } = await sbAdmin
      .from("employees")
      .select("avatar_url")
      .eq("id", id)
      .single();

    // Remove avatar from storage
    if (employee?.avatar_url) {
      const fileName = employee.avatar_url.split("/").pop();
      if (fileName) {
        await sbAdmin.storage.from("avatars").remove([`avatars/${fileName}`]);
      }
    }

    const { error } = await sbAdmin
      .from("employees")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ ok: true });
  } catch (err: any) {
    console.error("❌ deleteEmployee:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

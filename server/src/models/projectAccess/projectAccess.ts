import { sbAdmin } from "../../utils/lib/supabse";

// INSERT ACCESS
export async function insertProjectAccess(payload: {
  employee_id: string;
  project_id: string;
  can_view: boolean;
  can_edit: boolean;
  can_manage_tasks: boolean;
  can_manage_team: boolean;
}) {
  const { data, error } = await sbAdmin
    .from("project_access")
    .insert(payload) // now snake_case matches DB
    .select()
    .single();

  if (error) throw error;
  return data;
}

// FETCH ACCESS FOR EMPLOYEE
export async function getAccessForEmployee(employeeId: string) {
  const { data, error } = await sbAdmin
    .from("project_access")
    .select(`
      id,
      project_id,
      can_view,
      can_edit,
      can_manage_tasks,
      can_manage_team,
      new_projects (
        id,
        name,
        location,
        project_id
      )
    `)
    .eq("employee_id", employeeId);

  if (error) throw error;
  return data;
}

// UPDATE ACCESS
export async function updateProjectAccess(id: string, updates: any) {
  const { data, error } = await sbAdmin
    .from("project_access")
    .update(updates) // must also be snake_case
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// DELETE ACCESS
export async function deleteProjectAccess(id: string) {
  const { error } = await sbAdmin
    .from("project_access")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

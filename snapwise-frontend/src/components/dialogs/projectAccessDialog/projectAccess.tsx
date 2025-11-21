import React, { useMemo } from "react";
import {
  SlDialog,
  SlButton,
  SlIcon,
  SlSwitch,
  SlDivider,
} from "@shoelace-style/shoelace/dist/react";

import { useGetProjectsQuery } from "../../../api/project/projectsApi";
import {
  useCreateAccessMutation,
  useDeleteAccessMutation,
  useGetAccessQuery,
  useUpdateAccessMutation,
} from "../../../api/project/projectAccessApi";

type Props = {
  open: boolean;
  onClose: () => void;

  // IMPORTANT: this must be employees.id, not auth.user.id
  employeeId: string; 
};

export const ProjectAccessDialog: React.FC<Props> = ({
  open,
  onClose,
  employeeId,
}) => {
  const { data: projects } = useGetProjectsQuery();

  // fetch access for this employee
  const { data: accessData } = useGetAccessQuery(employeeId, {
    skip: !employeeId,
  });

  const [createAccess] = useCreateAccessMutation();
  const [deleteAccess] = useDeleteAccessMutation();
  const [updateAccess] = useUpdateAccessMutation();

  // transform array into fast-lookup map
  const assignedMap = useMemo(() => {
    const map = new Map();
    accessData?.access?.forEach((item: any) =>
      map.set(item.project_id, item)
    );
    return map;
  }, [accessData]);

  async function toggleProjectAccess(projectId: string, enable: boolean) {
    const existing = assignedMap.get(projectId);

    if (enable) {
      await createAccess({
  employee_id: employeeId,
  project_id: projectId,
  can_view: true,
  can_edit: false,
  can_manage_tasks: false,
  can_manage_team: false,
});
    } else if (existing) {
      await deleteAccess(existing.id);
    }
  }

  async function togglePermission(
    projectId: string,
    field: string,
    value: boolean
  ) {
    const existing = assignedMap.get(projectId);
    if (!existing) return;

    await updateAccess({
      id: existing.id,
      [field]: value,
    });
  }

  return (
    <SlDialog open={open} label="Assign Project Access" className="access-dialog">
      <h3>Project Permissions</h3>

      <div style={{ marginTop: "1rem" }}>
        {projects?.map((p: any) => {
          const accessRow = assignedMap.get(p.id);
          const hasAccess = Boolean(accessRow);

          return (
            <div
              key={p.id}
              style={{
                background: "#fafafa",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong>{p.name}</strong>

                <SlSwitch
                  checked={hasAccess}
                  onSlChange={(e: any) =>
                    toggleProjectAccess(p.id, e.target.checked)
                  }
                >
                  Allow
                </SlSwitch>
              </div>

              {hasAccess && (
                <>
                  <SlDivider style={{ margin: "0.5rem 0" }} />

                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    <label style={{ display: "flex", justifyContent: "space-between" }}>
                      Can Edit
                      <SlSwitch
                        checked={accessRow.can_edit}
                        onSlChange={(e: any) =>
                          togglePermission(p.id, "can_edit", e.target.checked)
                        }
                      />
                    </label>

                    <label style={{ display: "flex", justifyContent: "space-between" }}>
                      Can Manage Tasks
                      <SlSwitch
                        checked={accessRow.can_manage_tasks}
                        onSlChange={(e: any) =>
                          togglePermission(
                            p.id,
                            "can_manage_tasks",
                            e.target.checked
                          )
                        }
                      />
                    </label>

                    <label style={{ display: "flex", justifyContent: "space-between" }}>
                      Can Manage Team
                      <SlSwitch
                        checked={accessRow.can_manage_team}
                        onSlChange={(e: any) =>
                          togglePermission(
                            p.id,
                            "can_manage_team",
                            e.target.checked
                          )
                        }
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div
        slot="footer"
        style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}
      >
        <SlButton variant="default" onClick={onClose}>
          <SlIcon name="x" /> Close
        </SlButton>
      </div>
    </SlDialog>
  );
};

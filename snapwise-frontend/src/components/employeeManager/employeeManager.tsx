import React, { useState } from "react";
import {
  SlCard,
  SlButton,
  SlInput,
  SlIcon,
  SlSpinner
} from "@shoelace-style/shoelace/dist/react";

import {
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeesQuery,
} from "../../api/employee/employeesApi";
import { RoleSelect } from "../roleList/roleList";
import { ProjectAccessDialog } from "../dialogs/projectAccessDialog/projectAccess";

interface AddEmployeeProps {
  workplaceId: string;
  invitedBy: string;
}

export const AddEmployee: React.FC<AddEmployeeProps> = ({ workplaceId, invitedBy }) => {
  const { data, isLoading } = useGetEmployeesQuery(workplaceId, { skip: !workplaceId });
  const [createEmployee] = useCreateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "member",
    avatarFile: null as File | null,
    avatarPreview: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // === ACCESS DIALOG STATE ===
  const [accessOpen, setAccessOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const openAccessDialog = (id: string) => {
    setSelectedEmployeeId(id);
    setAccessOpen(true);
  };

  const closeAccessDialog = () => {
    setAccessOpen(false);
    setSelectedEmployeeId(null);
  };

  // === AVATAR HANDLING ===
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, avatarFile: file, avatarPreview: preview }));
  };

  // === CREATE EMPLOYEE ===
  const handleSubmit = async () => {
    if (!form.full_name || !form.email) {
      alert("Full name and email are required.");
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    fd.append("workplace_id", workplaceId);
    fd.append("invited_by", invitedBy);
    fd.append("full_name", form.full_name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("role", form.role);

    if (form.avatarFile) {
      fd.append("avatar", form.avatarFile);
    }

    await createEmployee(fd);

    setForm({
      full_name: "",
      email: "",
      phone: "",
      role: "member",
      avatarFile: null,
      avatarPreview: "",
    });

    setSubmitting(false);
  };

  return (
    <section style={{ padding: "1rem" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <SlIcon name="person-badge" /> Add Employee
      </h2>

      {/* FORM */}
      <div
        style={{
          background: "#f8f9fa",
          borderRadius: "8px",
          padding: "1rem",
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {/* Avatar Upload */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Avatar</label>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {form.avatarPreview ? (
              <img
                src={form.avatarPreview}
                alt="Avatar preview"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ccc",
                }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: "1px dashed #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                }}
              >
                <SlIcon name="person" style={{ fontSize: "1.8rem" }} />
              </div>
            )}

            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
        </div>

        {/* Inputs */}
        <SlInput
          label="Full Name"
          value={form.full_name}
          onSlInput={(e) =>
            setForm({ ...form, full_name: (e.target as HTMLInputElement).value })
          }
        />

        <SlInput
          label="Email"
          value={form.email}
          onSlInput={(e) =>
            setForm({ ...form, email: (e.target as HTMLInputElement).value })
          }
        />

        <SlInput
          label="Phone"
          value={form.phone}
          onSlInput={(e) =>
            setForm({ ...form, phone: (e.target as HTMLInputElement).value })
          }
        />

        {/* ROLE DROPDOWN */}
        <RoleSelect
          value={form.role}
          onChange={(role) => setForm({ ...form, role })}
        />

        {/* Save Button */}
        <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
          <SlButton variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <SlSpinner style={{ "--size": "1em" } as any} /> Saving…
              </>
            ) : (
              <>
                <SlIcon name="person-plus" /> Save Employee
              </>
            )}
          </SlButton>
        </div>
      </div>

      {/* EMPLOYEE LIST */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <SlSpinner />
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
          {data?.employees?.length ? (
            data.employees.map((e: any) => (
              <SlCard key={e.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Left Side Employee Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <img
                      src={
                        e.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          e.full_name
                        )}&background=EEE&color=111`
                      }
                      alt={e.full_name}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />

                    <div>
                      <strong>{e.full_name}</strong>
                      <div style={{ fontSize: "0.8rem", color: "#555" }}>{e.email}</div>
                      {e.phone && (
                        <div style={{ fontSize: "0.7rem", color: "#777" }}>{e.phone}</div>
                      )}
                      <div style={{ fontSize: "0.75rem" }}>
                        <b>Role:</b> {e.role}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <SlButton
                      size="small"
                      variant="default"
                      onClick={() => openAccessDialog(e.user_id)}
                    >
                      <SlIcon name="key" /> Give Access
                    </SlButton>

                    <SlButton
                      size="small"
                      variant="danger"
                      onClick={() => deleteEmployee(e.id)}
                    >
                      <SlIcon name="trash" />
                    </SlButton>
                  </div>
                </div>
              </SlCard>
            ))
          ) : (
            <div style={{ textAlign: "center", color: "#777" }}>
              No employees yet.
            </div>
          )}
        </div>
      )}

      {/* ACCESS DIALOG */}
      {selectedEmployeeId && (
        <ProjectAccessDialog
          open={accessOpen}
          onClose={closeAccessDialog}
          employeeId={selectedEmployeeId}
        />
      )}
    </section>
  );
};

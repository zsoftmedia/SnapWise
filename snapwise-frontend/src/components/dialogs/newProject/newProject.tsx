import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SlAvatar,
  SlBadge,
  SlButton,
  SlCard,
  SlDialog,
  SlIcon,
  SlInput,
  SlOption,
  SlSelect,
  SlSwitch,
  SlTextarea
} from "@shoelace-style/shoelace/dist/react";
import {
  CreateProjectBody,
  useCreateProjectMutation
} from "../../../api/project/projectsApi";
import { supabase } from "../../../lib/supabase";
import "./newproject.css";
import { useGetEmployeesQuery } from "../../../api/employee/employeesApi";

/* ============================================================
   TeamMember TYPE
============================================================ */
export type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  avatarPreview?: string | null;
  userId?: string | null;
  workplaceId?: string | null;
  projectId?: string | null;
  defaultProjectId?: string | null;
  role: "owner" | "admin" | "supervisor" | "member" | "viewer";
  status: "invited" | "active" | "suspended";
  invitedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type NewProjectPayload = {
  id: string;
  name: string;
  location: string;
  projectId: string;
  startDate?: string;
  endDate?: string;
  supervisor?: string;
  workType?: string;
  notes?: string;
  planImageDataUrl?: string;
  allowGps: boolean;
  clientName?: string;
  budgetEUR?: number;
  teamMembers?: any[];
  workplace_id: string;
};

type NewProjectDialogProps = {
  open: boolean;
  onCancel: () => void;
  onCreate: (payload: NewProjectPayload) => void;
  workplaceId: string;
};

/* ============================================================
   Generate readable project ID
============================================================ */
function generateReadableProjectId() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++)
    suffix += chars[Math.floor(Math.random() * chars.length)];
  return `PRJ-${yyyy}-${mm}-${dd}-${suffix}`;
}

const toWorkType = (v?: string): CreateProjectBody["workType"] => {
  const allowed = [
    "renovation",
    "new_build",
    "maintenance",
    "electrical",
    "plumbing",
    "masonry",
    "other"
  ] as const;
  return (allowed as readonly string[]).includes(v ?? "")
    ? (v as CreateProjectBody["workType"])
    : undefined;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function NewProjectDialog({
  open,
  onCancel,
  onCreate,
  workplaceId
}: NewProjectDialogProps) {
  const [createProject, { isLoading }] = useCreateProjectMutation();

  /* Fetch employees from this workplace */
  const { data: employeesData } = useGetEmployeesQuery(workplaceId, {
    skip: !workplaceId
  });

  const TEAM_MEMBERS: TeamMember[] = useMemo(() => {
    if (!employeesData?.employees) return [];
    return employeesData.employees.map((e: any) => ({
      id: e.id,
      fullName: e.full_name,
      email: e.email,
      phone: e.phone ?? "",
      avatarUrl: e.avatar_url ?? "",
      avatarPreview: e.avatar_preview ?? "",
      userId: e.user_id ?? "",
      workplaceId: e.workplace_id ?? "",
      role: e.role,
      status: e.status,
      invitedBy: e.invited_by ?? "",
      createdAt: e.created_at,
      updatedAt: e.updated_at
    })) as TeamMember[];
  }, [employeesData]);

  /* Logged user */
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    })();
  }, []);

  /* Form state */
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [projectId, setProjectId] = useState("");
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [supervisor, setSupervisor] = useState("");
  const [workType, setWorkType] = useState<string>();
  const [notes, setNotes] = useState("");
  const [clientName, setClientName] = useState("");
  const [budget, setBudget] = useState<string>("");
  const [allowGps, setAllowGps] = useState(false);
  const [planImageDataUrl, setPlanImageDataUrl] = useState<string>();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) setProjectId(generateReadableProjectId());
  }, [open]);

  const isFormValid = name.trim().length > 0 && location.trim().length > 0;

  /* File handling */
  function openFilePicker() {
    fileInputRef.current?.click();
  }
  function handlePlanFileList(list: FileList | null) {
    if (!list || list.length === 0) return;
    const file = list[0];
    const reader = new FileReader();
    reader.onload = () => setPlanImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    handlePlanFileList(e.dataTransfer.files);
  }

  /* ============================================================
     CREATE PROJECT — FIX: Team Role & Workplace ID in Payload
  ============================================================= */
  async function handleCreateProject() {
    if (!isFormValid) return;

    // FIX: Explicitly include the employee's existing role
    const selectedMembers = selectedTeamMemberIds.map((id) => {
      const e = TEAM_MEMBERS.find((t) => t.id === id)!;
      return {
        id: e.id,
        fullName: e.fullName,
        email: e.email,
        phone: e.phone ?? undefined,
        avatarUrl: e.avatarUrl ?? undefined,
        userId: e.userId ?? undefined,
        role: e.role, // 🔥 Role included
      };
    });

    const payload: NewProjectPayload = {
      id: crypto.randomUUID(),
      name: name.trim(),
      location: location.trim(),
      projectId: projectId.trim(),
      workplace_id: workplaceId, // ✅ workplaceId included
      startDate,
      endDate,
      supervisor: supervisor.trim() || undefined,
      workType: workType || undefined,
      notes: notes.trim() || undefined,
      planImageDataUrl,
      allowGps,
      clientName: clientName.trim() || undefined,
      budgetEUR: budget ? Number(budget) : undefined,
      teamMembers: selectedMembers.length ? selectedMembers : undefined
    };

    const body: CreateProjectBody & { workplace_id: string } = {
      ...payload,
      workType: toWorkType(payload.workType),
      created_by: userId || undefined,
      workplace_id: workplaceId // ✅ workplaceId included in API body
    };

    try {
      await createProject(body).unwrap();
      onCreate(payload);
    } catch (err) {
      console.error("❌ Failed to create project:", err);
    }
  }

  /* ============================================================
     RENDER
  ============================================================= */
  return (
    <SlDialog
      open={open}
      className="npd-root"
      label="Create a New Project"
      onSlRequestClose={(e: any) => {
        if (e.detail.source === "overlay" || e.detail.source === "keyboard")
          e.preventDefault();
      }}
      style={{ "--width": "42vw", "--body-spacing": "16px" } as any}
    >
      <div className="npd-content">

        {/* ============================
            PROJECT PLAN + TEAM (Unchanged UI)
        ============================ */}
        <SlCard className="npd-section">
          <div slot="header">
            <SlIcon name="image" /> Plan Attachment & Team
          </div>

          <div className="npd-grid">
            {/* PLAN UPLOAD */}
            <div className="npd-field npd-colspan-2">
              <label>Project Plan (Image)</label>
              <div
                className={`npd-drop ${isDragOver ? "is-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                {planImageDataUrl ? (
                  <div className="npd-plan">
                    <img src={planImageDataUrl} alt="Project plan" />
                    <div className="npd-plan-meta">
                      <SlBadge pill>image attached</SlBadge>
                      <SlButton
                        size="small"
                        variant="default"
                        onClick={() => setPlanImageDataUrl(undefined)}
                      >
                        <SlIcon name="trash" /> Remove
                      </SlButton>
                    </div>
                  </div>
                ) : (
                  <>
                    <SlIcon name="image" />
                    <div>Drag & drop plan here or</div>
                    <SlButton size="small" onClick={openFilePicker}>
                      <SlIcon name="upload" /> Upload
                    </SlButton>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="npd-file"
                      onChange={(e) => {
                        handlePlanFileList(e.target.files);
                        e.currentTarget.value = "";
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="npd-field npd-colspan-2">
              <SlSwitch
                checked={allowGps}
                onSlChange={(e: any) => setAllowGps(!!e.target.checked)}
              >
                Allow GPS capture for site photos
              </SlSwitch>
            </div>

            <div className="npd-field npd-colspan-2">
              <label>Team Members</label>
              <SlSelect
                multiple
                size="small"
                value={selectedTeamMemberIds}
                placeholder="Select team members"
                onSlChange={(e: any) => {
                  const v = e.detail?.value ?? e.target.value;
                  setSelectedTeamMemberIds(Array.isArray(v) ? v : [v]);
                }}
              >
                {TEAM_MEMBERS.map((m) => (
                  <SlOption key={m.id} value={m.id}>
                    <SlAvatar
                      slot="prefix"
                      image={m.avatarUrl || ""}
                      label={m.fullName}
                      style={{ ["--size" as any]: "20px" }}
                    />
                    {m.fullName}
                  </SlOption>
                ))}
              </SlSelect>
            </div>
          </div>
        </SlCard>

        {/* ============================
            PROJECT INFO (Unchanged UI)
        ============================ */}
        <SlCard className="npd-section">
          <div slot="header">
            <SlIcon name="folder" /> Project Information
          </div>

          <div className="npd-grid">
            <div className="npd-field">
              <label>Project Name</label>
              <SlInput
                size="small"
                value={name}
                placeholder="e.g., Building A"
                onSlChange={(e: any) => setName(e.target.value)}
              />
            </div>

            <div className="npd-field">
              <label>Location</label>
              <SlInput
                size="small"
                value={location}
                placeholder="City, Street"
                onSlChange={(e: any) => setLocation(e.target.value)}
              />
            </div>

            <div className="npd-field">
              <label>Project ID</label>
              <div className="npd-row">
                <SlInput
                  size="small"
                  value={projectId}
                  onSlChange={(e: any) => setProjectId(e.target.value)}
                />
                <SlButton
                  size="small"
                  onClick={() => setProjectId(generateReadableProjectId())}
                >
                  <SlIcon name="arrow-clockwise" />
                </SlButton>
              </div>
            </div>

            <div className="npd-field">
              <label>Supervisor</label>
              <SlInput
                size="small"
                value={supervisor}
                placeholder="e.g., Zohaib Ali"
                onSlChange={(e: any) => setSupervisor(e.target.value)}
              />
            </div>
          </div>
        </SlCard>

        {/* ============================
            TIMELINE (Unchanged UI)
        ============================ */}
        <SlCard className="npd-section">
          <div slot="header">
            <SlIcon name="calendar-date" /> Timeline
          </div>

          <div className="npd-grid">
            <div className="npd-field">
              <label>Start Date</label>
              <SlInput
                size="small"
                type="date"
                value={startDate ?? ""}
                onSlChange={(e: any) => setStartDate(e.target.value)}
              />
            </div>

            <div className="npd-field">
              <label>End Date</label>
              <SlInput
                size="small"
                type="date"
                value={endDate ?? ""}
                onSlChange={(e: any) => setEndDate(e.target.value)}
              />
            </div>

            <div className="npd-field npd-colspan-2">
              <label>Type of Work</label>
              <SlSelect
                size="small"
                value={workType}
                placeholder="Select type"
                onSlChange={(e: any) => setWorkType(e.detail?.value)}
              >
                <SlOption value="renovation">Renovation</SlOption>
                <SlOption value="new_build">New Build</SlOption>
                <SlOption value="maintenance">Maintenance</SlOption>
                <SlOption value="electrical">Electrical</SlOption>
                <SlOption value="plumbing">Plumbing</SlOption>
                <SlOption value="masonry">Masonry</SlOption>
                <SlOption value="other">Other</SlOption>
              </SlSelect>
            </div>
          </div>
        </SlCard>

        {/* ============================
            CLIENT + BUDGET (Unchanged UI)
        ============================ */}
        <SlCard className="npd-section">
          <div slot="header">
            <SlIcon name="person" /> Client & Budget
          </div>

          <div className="npd-grid">
            <div className="npd-field">
              <label>Client</label>
              <SlInput
                size="small"
                value={clientName}
                placeholder="Client Name"
                onSlChange={(e: any) => setClientName(e.target.value)}
              />
            </div>

            <div className="npd-field">
              <label>Budget (€)</label>
              <SlInput
                size="small"
                type="number"
                value={budget}
                placeholder="50000"
                onSlChange={(e: any) => setBudget(e.target.value)}
              />
            </div>

            <div className="npd-field npd-colspan-2">
              <label>Notes</label>
              <SlTextarea
                rows={3}
                value={notes}
                placeholder="Project details"
                onSlChange={(e: any) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </SlCard>

        {/* ============================
            FOOTER (Unchanged UI)
        ============================ */}
        <div className="npd-footer">
          <SlButton size="small" variant="default" onClick={onCancel}>
            <SlIcon name="x" /> Cancel
          </SlButton>
          <SlButton
            size="small"
            variant="primary"
            disabled={!isFormValid || isLoading}
            onClick={handleCreateProject}
          >
            <SlIcon name={isLoading ? "hourglass-split" : "check2"} />{" "}
            {isLoading ? "Saving..." : "Create Project"}
          </SlButton>
        </div>
      </div>
    </SlDialog>
  );
}
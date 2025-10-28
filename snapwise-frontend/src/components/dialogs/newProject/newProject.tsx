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
import { CreateProjectBody, useCreateProjectMutation } from "../../../api/project/projectsApi";
import { supabase } from "../../../lib/supabase"; // ✅ added
import "./newproject.css";

export type TeamMember = {
  id: string;
  fullName: string;
  avatarUrl: string;
  phone: string;
  email: string;
  userId: string;
  projectId?: string;
  defaultProjectId?: string;
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
  teamMembers?: TeamMember[];
};

type NewProjectDialogProps = {
  open: boolean;
  onCancel: () => void;
  onCreate: (payload: NewProjectPayload) => void;
};

function generateReadableProjectId() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `PRJ-${yyyy}-${mm}-${dd}-${suffix}`;
}

const toWorkType = (v?: string): CreateProjectBody["workType"] => {
  const allowed = ["renovation","new_build","maintenance","electrical","plumbing","masonry","other"] as const;
  return (allowed as readonly string[]).includes(v ?? "") ? (v as CreateProjectBody["workType"]) : undefined;
};

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: "tm-1", fullName: "Alice Schneider", avatarUrl: "https://i.pravatar.cc/100?img=1", phone: "+43 660 111 1111", email: "alice@example.com", userId: "u-1001" },
  { id: "tm-2", fullName: "Bernhard Hofer", avatarUrl: "https://i.pravatar.cc/100?img=2", phone: "+43 660 222 2222", email: "bernhard@example.com", userId: "u-1002" },
  { id: "tm-3", fullName: "Carla Gruber", avatarUrl: "https://i.pravatar.cc/100?img=3", phone: "+43 660 333 3333", email: "carla@example.com", userId: "u-1003" }
];

export default function NewProjectDialog({ open, onCancel, onCreate }: NewProjectDialogProps) {
  const [createProject, { isLoading, isSuccess }] = useCreateProjectMutation();

  const [userId, setUserId] = useState<string | null>(null); // ✅ Added
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    })();
  }, []);
console.log(userId)
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

  function openSystemFilePicker() {
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

  async function handleCreateProject() {
  if (!isFormValid) return;

  // ✅ Build team members
  const selectedMembers: TeamMember[] = selectedTeamMemberIds.map(id => {
    const base = MOCK_TEAM_MEMBERS.find(t => t.id === id)!;
    const readableId = projectId.trim();
    return { ...base, projectId: readableId, defaultProjectId: readableId };
  });

  // ✅ Build project payload
  const payload: NewProjectPayload = {
    id: crypto.randomUUID(),
    name: name.trim(),
    location: location.trim(),
    projectId: projectId.trim(),
    startDate,
    endDate,
    supervisor: supervisor.trim() || undefined,
    workType: workType || undefined,
    notes: notes.trim() || undefined,
    planImageDataUrl,
    allowGps,
    clientName: clientName.trim() || undefined,
    budgetEUR: budget ? Number(budget) || undefined : undefined,
    teamMembers: selectedMembers.length ? selectedMembers : undefined,
  };

  // ✅ Add Supabase user ID (required by backend)
  const body: any = { 
    ...payload, 
    workType: toWorkType(payload.workType),
    created_by: userId || undefined,  // ✅ added field
  };

  try {
    const res = await createProject(body).unwrap();
    console.log("Project stored successfully:", res);
    onCreate(payload);
  } catch (err) {
    console.error("Failed to create project:", err);
  }
}

  return (
    <SlDialog
      open={open}
      className="npd-root"
      label="Create a New Project"
      onSlRequestClose={(e: any) => {
        if (e.detail.source === "overlay" || e.detail.source === "keyboard") e.preventDefault();
      }}
      style={{ "--width": "42vw", "--body-spacing": "16px" } as any}
    >
      <div className="npd-content">
        <SlCard className="npd-section">
          <div slot="header">
            <SlIcon name="image" /> Plan Attachment & Team
          </div>
          <div className="npd-grid">
            <div className="npd-field npd-colspan-2">
              <label>Project Plan (Image)</label>
              <div
                className={`npd-drop ${isDragOver ? "is-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                {planImageDataUrl ? (
                  <div className="npd-plan">
                    <img src={planImageDataUrl} alt="Project plan" />
                    <div className="npd-plan-meta">
                      <SlBadge pill>image attached</SlBadge>
                      <SlButton size="small" variant="default" onClick={() => setPlanImageDataUrl(undefined)}>
                        <SlIcon name="trash" /> Remove
                      </SlButton>
                    </div>
                  </div>
                ) : (
                  <>
                    <SlIcon name="image" />
                    <div>Drag & drop plan here or</div>
                    <SlButton size="small" onClick={openSystemFilePicker}>
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
              <SlSwitch checked={allowGps} onSlChange={(e: any) => setAllowGps(!!e.target.checked)}>
                Allow GPS capture for site photos
              </SlSwitch>
            </div>
            <div className="npd-field npd-colspan-2">
              <label>Team Members</label>
              <SlSelect
                size="small"
                multiple
                value={selectedTeamMemberIds}
                placeholder="Select team members"
                onSlChange={(e: any) => {
                  const nextValue = (e.detail?.value ?? e.target.value) as string[] | string;
                  setSelectedTeamMemberIds(Array.isArray(nextValue) ? nextValue : [nextValue]);
                }}
              >
                {MOCK_TEAM_MEMBERS.map(member => (
                  <SlOption key={member.id} value={member.id}>
                    <SlAvatar slot="prefix" image={member.avatarUrl} label={member.fullName} style={{ ["--size" as any]: "20px" }} />
                    {member.fullName}
                  </SlOption>
                ))}
              </SlSelect>
            </div>
          </div>
        </SlCard>

        <SlCard className="npd-section">
          <div slot="header">
            <SlIcon name="folder" /> Project Information
          </div>
          <div className="npd-grid">
            <div className="npd-field">
              <label>Project Name</label>
              <SlInput size="small" value={name} placeholder="e.g., Building A" onSlChange={(e: any) => setName(e.target.value)} />
            </div>
            <div className="npd-field">
              <label>Location</label>
              <SlInput size="small" value={location} placeholder="City, Street" onSlChange={(e: any) => setLocation(e.target.value)} />
            </div>
            <div className="npd-field">
              <label>Project ID</label>
              <div className="npd-row">
                <SlInput size="small" value={projectId} placeholder="PRJ-..." onSlChange={(e: any) => setProjectId(e.target.value)} />
                <SlButton size="small" variant="default" onClick={() => setProjectId(generateReadableProjectId())}>
                  <SlIcon name="arrow-clockwise" />
                </SlButton>
              </div>
            </div>
            <div className="npd-field">
              <label>Supervisor</label>
              <SlInput size="small" value={supervisor} placeholder="e.g., Zohaib Ali" onSlChange={(e: any) => setSupervisor(e.target.value)} />
            </div>
          </div>
        </SlCard>

        <SlCard className="npd-section">
          <div slot="header">
            <SlIcon name="calendar-date" /> Timeline
          </div>
          <div className="npd-grid">
            <div className="npd-field">
              <label>Start Date</label>
              <SlInput size="small" type="date" value={startDate ?? ""} onSlChange={(e: any) => setStartDate(e.target.value || undefined)} />
            </div>
            <div className="npd-field">
              <label>End Date</label>
              <SlInput size="small" type="date" value={endDate ?? ""} onSlChange={(e: any) => setEndDate(e.target.value || undefined)} />
            </div>
            <div className="npd-field npd-colspan-2">
              <label>Type of Work</label>
              <SlSelect size="small" value={workType} placeholder="Select type" onSlChange={(e: any) => setWorkType(e.detail?.value ?? e.target.value)}>
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

        <SlCard className="npd-section">
          <div slot="header">
            <SlIcon name="person" /> Client & Budget
          </div>
          <div className="npd-grid">
            <div className="npd-field">
              <label>Client</label>
              <SlInput size="small" value={clientName} placeholder="Client Name" onSlChange={(e: any) => setClientName(e.target.value)} />
            </div>
            <div className="npd-field">
              <label>Budget (€)</label>
              <SlInput size="small" type="number" placeholder="e.g., 50000" value={budget} onSlChange={(e: any) => setBudget(e.target.value)} />
            </div>
            <div className="npd-field npd-colspan-2">
              <label>Notes</label>
              <SlTextarea rows={3} placeholder="Project details" value={notes} onSlChange={(e: any) => setNotes(e.target.value)} />
            </div>
          </div>
        </SlCard>

        <div className="npd-footer">
          <div className="npd-footer-right">
            <SlButton size="small" variant="default" onClick={onCancel}>
              <SlIcon name="x" /> Cancel
            </SlButton>
            <SlButton size="small" variant="primary" disabled={!isFormValid || isLoading} onClick={handleCreateProject}>
              <SlIcon name={isLoading ? "hourglass-split" : "check2"} /> {isLoading ? "Saving..." : "Create Project"}
            </SlButton>
          </div>
        </div>
      </div>
    </SlDialog>
  );
}

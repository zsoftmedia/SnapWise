import React, { useEffect, useMemo, useState } from "react";
import "./master.css";
import {
  SlAvatar,
  SlBadge,
  SlButton,
  SlDialog,
  SlDivider,
  SlDropdown,
  SlIcon,
  SlMenu,
  SlMenuItem
} from "@shoelace-style/shoelace/dist/react";
import {
  useGetProjectsQuery,
  useGetProjectTeamMembersQuery
} from "../../api/project/projectsApi";
import { supabase } from "../../lib/supabase"; // ✅ Import Supabase
import NewProjectDialog from "../dialogs/newProject/newProject";
import ConstructionSiteReportForm from "../pages/ConstructionSiteReportForm";
import TasksMasterDetail from "../pages/task/TasksMasterDetail";
import ProjectDrawer from "../projectDrawer/projectDrawer";

type Project = {
  id: string;
  name: string;
  location?: string;
  projectId?: string; // human-readable ID
};

export default function MasterView() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [sessionReady, setSessionReady] = useState(false);

  /* ======================
     ✅ Wait for Supabase Session
     ====================== */
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setSessionReady(true);
      } else {
        console.warn("⚠️ No Supabase session found — please log in.");
      }
    })();
  }, []);

  /* ======================
     ✅ Fetch Projects (after auth)
     ====================== */
  const { data: dbProjects, isFetching, error } = useGetProjectsQuery(undefined, {
    skip: !sessionReady, // wait until session is ready
  });

  useEffect(() => {
    if (dbProjects && Array.isArray(dbProjects)) {
      setProjectList(
        dbProjects.map((r) => ({
          id: r.id,
          name: r.name,
          location: r.location || "",
          projectId: r.project_id
        }))
      );
    }
  }, [dbProjects]);

  useEffect(() => {
    if (error) console.error("❌ Failed to fetch projects:", error);
  }, [error]);

  const activeProject = useMemo(
    () => projectList.find((p) => p.id === activeProjectId) ?? null,
    [projectList, activeProjectId]
  );

  /* ======================
     ✅ Fetch Team Members
     ====================== */
  const { data: team = [], isFetching: teamLoading } = useGetProjectTeamMembersQuery(
    activeProjectId as string,
    { skip: !activeProjectId }
  );

  const avatarSrc = (fullName: string, url?: string | null) =>
    url && url.trim()
      ? url
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=EEE&color=111`;

  /* ======================
     ✅ Dialog Handlers
     ====================== */
  function openCreateTaskDialog() {
    if (!activeProject) return;
    setIsTaskDialogOpen(true);
  }
  function closeCreateTaskDialog() {
    setIsTaskDialogOpen(false);
  }

  const currentUserName = "Zohaib Ali";

  const activeProjectPayload = activeProject
    ? {
        projectRowId: activeProject.id,
        projectName: activeProject.name,
        projectReadableId: activeProject.projectId || "",
        location: activeProject.location || "",
        supervisor: "",
        allowGps: false,
        area: "",
        floor: "",
        room: "",
        workPackage: ""
      }
    : null;

  /* ======================
     ✅ RENDER
     ====================== */
  return (
    <div className={`mv-root ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
      {/* LEFT PANEL */}
      <aside className="mv-sidebar" aria-label="Project navigation">
        SnapWise
        <div className="mv-sidebar-head">
          <div className="mv-brand">
            <SlAvatar
              image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
              label="User avatar"
              style={{ ["--size" as any]: "32px" }}
            />
            {!isSidebarCollapsed && <span className="mv-brand-name">Workspace</span>}
          </div>

          <SlButton
            className="mv-collapse-btn"
            size="small"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <SlIcon name={isSidebarCollapsed ? "chevron-right" : "box-arrow-left"} />
          </SlButton>
        </div>

        {/* Actions */}
        <div className="mv-actions">
          <SlButton
            variant="primary"
            size="small"
            onClick={() => setIsNewProjectDialogOpen(true)}
          >
            <SlIcon name="plus-lg" />
            {!isSidebarCollapsed && <span>New Project</span>}
          </SlButton>
        </div>

        {/* Project list */}
        <nav className="mv-projects" aria-label="Projects">
          {isFetching && !projectList.length && (
            <div className="mv-empty">Loading projects…</div>
          )}

          {projectList.map((project) => (
            <button
              key={project.id}
              className={`mv-project-item ${activeProjectId === project.id ? "is-active" : ""}`}
              onClick={() => setActiveProjectId(project.id)}
              title={project.name}
            >
              <SlIcon name="folder2" />
              {!isSidebarCollapsed && <span className="mv-project-name">{project.name}</span>}
            </button>
          ))}

          {!isFetching && projectList.length === 0 && !isSidebarCollapsed && (
            <div className="mv-empty">No projects yet.</div>
          )}
        </nav>

        {/* User/account footer */}
        <div className="mv-sidebar-foot">
          <SlAvatar
            image="https://ui-avatars.com/api/?name=Z+A&background=EEE&color=111"
            label="Zohaib Ali"
            style={{ ["--size" as any]: "28px" }}
          />
          {!isSidebarCollapsed && (
            <div className="mv-user">
              <div className="mv-user-name">Zohaib Ali</div>
              <div className="mv-user-role">Supervisor</div>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <section className="mv-stage" aria-label="Details panel">
        <header className="mv-stage-head">
          <div className="mv-breadcrumbs">
            <SlIcon name="house" />
            <span> / </span>
            <span>
              {activeProject ? activeProject.name : isFetching ? "Loading…" : "Select a project"}
            </span>
          </div>

          <div className="mv-head-actions">
            <>
              <SlButton size="small" variant="neutral">
                <SlIcon name="search" />
                <span>Search</span>
              </SlButton>
              <SlDropdown placement="bottom-end">
  <SlButton slot="trigger" size="small" variant="default" outline>
    <SlIcon name="gear" />
    <span>Settings</span>
  </SlButton>

  <SlMenu>
    <SlMenuItem>
      <SlIcon slot="prefix" name="person" />
      Profile
    </SlMenuItem>

    <SlMenuItem>
      <SlIcon slot="prefix" name="gear" />
      Preferences
    </SlMenuItem>

    <SlDivider></SlDivider>

    <SlMenuItem
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.reload(); // ✅ refresh to clear state
      }}
      style={{ color: "var(--sl-color-danger-600)" }}
    >
      <SlIcon slot="prefix" name="box-arrow-right" />
      Logout
    </SlMenuItem>
  </SlMenu>
</SlDropdown>

            </>
          </div>
        </header>

        <div className="mv-stage-body">
          {activeProject ? (
            <div>
              <div className="mv-card">
                <h3 className="mv-card-title">{activeProject.name}</h3>
                <p className="mv-card-sub">
                  {activeProject.projectId ? `ID: ${activeProject.projectId}` : ""}{" "}
                  {activeProject.location ? `• ${activeProject.location}` : ""}
                </p>

                {/* Team avatars + count + Create Task */}
                <div
                  className="mv-card-row">
                  {/* Avatars */}
                  <div
                    className="avatar-group"
                    style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
                  >
                    {teamLoading && <span className="mv-muted">Loading team…</span>}

                    {!teamLoading && team.length > 0 && team.map((m) => (
                      <SlAvatar
                        key={m.id}
                        image={avatarSrc(m.full_name, m.avatar_url)}
                        label={m.full_name}
                        title={m.full_name}
                        style={{ ["--size" as any]: "36px" }}
                      />
                    ))}

                    {!teamLoading && team.length === 0 && (
                      <span className="mv-muted">No team added</span>
                    )}
                  </div>

                  {/* Count badge */}
                  {!teamLoading && (
                    <SlBadge pill>{team.length}</SlBadge>
                  )}

                  {/* Create Task */}
                  <SlButton
                    size="small"
                    variant="primary"
                    onClick={openCreateTaskDialog}
                    disabled={!activeProject}
                  >
                    <SlIcon name="plus-lg" />
                    <span>Create Task</span>
                  </SlButton>
                  
                  <ProjectDrawer projectId={activeProjectId!} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mv-placeholder">
              <SlIcon name="layout-split" />
              <div>Select a project from the left to view details.</div>
            </div>
          )}
        </div>

        {/* Task Master-Detail */}
        {activeProjectId ? (
          <TasksMasterDetail projectId={activeProjectId} />
        ) : (
          <div className="mv-placeholder">
            <SlIcon name="layout-split" />
            <div>Select a project to see tasks.</div>
          </div>
        )}
      </section>

      {/* New Project Dialog */}
      <NewProjectDialog
        open={isNewProjectDialogOpen}
        onCancel={() => setIsNewProjectDialogOpen(false)}
        onCreate={(payload) => {
          setProjectList((prev) => [
            { id: payload.id, name: payload.name, location: payload.location, projectId: payload.projectId },
            ...prev
          ]);
          setActiveProjectId(payload.id);
          setIsNewProjectDialogOpen(false);
        }}
      />

      {/* Create Task Dialog */}
      <SlDialog
        open={isTaskDialogOpen}
        label={activeProject ? `Create Task – ${activeProject.name}` : "Create Task"}
        onSlRequestClose={() => setIsTaskDialogOpen(false)}
        style={{ ["--width" as any]: "80vw", ["--body-spacing" as any]: "16px" }}
      >
        {activeProject && (
          <ConstructionSiteReportForm
            activeProject={activeProjectPayload!}
            createdByName={currentUserName}
          />
        )}

        {!activeProjectPayload && <div>Please select a project first.</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <SlButton variant="neutral" onClick={closeCreateTaskDialog}>
            <SlIcon name="x" />
            <span>Close</span>
          </SlButton>
        </div>
      </SlDialog>
    </div>
  );
}

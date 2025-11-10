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
  SlMenuItem,
} from "@shoelace-style/shoelace/dist/react";
import {
  useGetProjectsQuery,
  useGetProjectTeamMembersQuery,
} from "../../api/project/projectsApi";
import { supabase } from "../../lib/supabase";
import NewProjectDialog from "../dialogs/newProject/newProject";
import ConstructionSiteReportForm from "../pages/ConstructionSiteReportForm";
import TasksMasterDetail from "../pages/task/TasksMasterDetail";
import ProjectDrawer from "../projectDrawer/projectDrawer";

type Project = {
  id: string;
  name: string;
  location?: string;
  projectId?: string;
};

export default function MasterView() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) setSessionReady(true);
    })();
  }, []);

  const { data: dbProjects, isFetching, error } = useGetProjectsQuery(undefined, {
    skip: !sessionReady,
  });

  useEffect(() => {
    if (dbProjects) {
      setProjectList(
        dbProjects.map((r) => ({
          id: r.id,
          name: r.name,
          location: r.location || "",
          projectId: r.project_id,
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

  const { data: team = [], isFetching: teamLoading } =
    useGetProjectTeamMembersQuery(activeProjectId as string, {
      skip: !activeProjectId,
    });

  const avatarSrc = (fullName: string, url?: string | null) =>
    url && url.trim()
      ? url
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          fullName
        )}&background=EEE&color=111`;

  const activeProjectPayload = activeProject
    ? {
        projectRowId: activeProject.id,
        projectName: activeProject.name,
        projectReadableId: activeProject.projectId || "",
        location: activeProject.location || "",
      }
    : null;

  const currentUserName = "Zohaib Ali";

  return (
    <div className={`mv-root ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
      {/* ====================== SIDEBAR ====================== */}
      <aside className="mv-sidebar">
        <div className="mv-sidebar-top">
          <img
            src={`${process.env.PUBLIC_URL}/images/lightLogo.png`}
            alt="SnapWise"
            className="mv-logo"
          />
          <SlButton
            className="mv-collapse-btn"
            size="small"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
          >
            <SlIcon name={isSidebarCollapsed ? "chevron-right" : "box-arrow-left"} />
          </SlButton>
        </div>

        {/* New Project */}
        <div className="mv-actions">
          <SlButton
            size="small"
            variant="primary"
            className="mv-new-project-btn"
            onClick={() => setIsNewProjectDialogOpen(true)}
          >
            <SlIcon name="plus-lg" />
            {!isSidebarCollapsed && <span>New Project</span>}
          </SlButton>
        </div>

        <SlDivider className="mv-divider" />

        {/* Project List */}
        <nav className="mv-projects">
          {isFetching && !projectList.length && (
            <div className="mv-empty">Loading projects…</div>
          )}

          {projectList.map((project) => (
            <button
              key={project.id}
              className={`mv-project-item ${
                activeProjectId === project.id ? "is-active" : ""
              }`}
              onClick={() => setActiveProjectId(project.id)}
            >
              <SlIcon name="folder2" className="mv-project-icon" />
              {!isSidebarCollapsed && (
                <span className="mv-project-name">{project.name}</span>
              )}
            </button>
          ))}

          {!isFetching && projectList.length === 0 && !isSidebarCollapsed && (
            <div className="mv-empty">No projects yet.</div>
          )}
        </nav>

        {/* Bottom User Avatar */}
        <div className="mv-sidebar-foot">
          <SlAvatar
            image="https://ui-avatars.com/api/?name=Zohaib+Ali&background=0f172a&color=fff"
            label="User avatar"
            style={{ ["--size" as any]: "36px" }}
          />
          {!isSidebarCollapsed && (
            <div className="mv-user-info">
              <div className="mv-user-name">Zohaib Ali</div>
              <div className="mv-user-role">Supervisor</div>
            </div>
          )}
        </div>
      </aside>

      {/* ====================== RIGHT PANEL ====================== */}
      <section className="mv-stage">
        <header className="mv-stage-head">
          <div className="mv-breadcrumbs">
            <SlIcon name="house" />
            <span> / </span>
            <span>
              {activeProject
                ? activeProject.name
                : isFetching
                ? "Loading…"
                : "Select a project"}
            </span>
          </div>

          <div className="mv-head-actions">
            <SlDropdown placement="bottom-end">
              <SlButton slot="trigger" size="small" variant="text">
                <SlIcon name="gear" style={{ fontSize: "1.3rem" }} />
              </SlButton>
              <SlMenu>
                <SlMenuItem>
                  <SlIcon slot="prefix" name="person" />
                  Profile
                </SlMenuItem>
                <SlDivider />
                <SlMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  style={{ color: "var(--sl-color-danger-600)" }}
                >
                  <SlIcon slot="prefix" name="box-arrow-right" />
                  Logout
                </SlMenuItem>
              </SlMenu>
            </SlDropdown>
          </div>
        </header>

        {/* MAIN BODY */}
        <div className="mv-stage-body">
          {activeProject ? (
            <div className="mv-card">
              <div className="card-project-detail">
                <h3 className="mv-card-title">{activeProject.name}</h3>
                <p className="mv-card-sub">
                  {activeProject.location ? ` ${activeProject.location}` : ""}
                </p>
              </div>
              

              <div className="mv-card-row">
                <div className="avatar-group">
                  {teamLoading && <span className="mv-muted">Loading team…</span>}
                  {!teamLoading &&
                    team.map((m) => (
                      <SlAvatar
                        key={m.id}
                        image={avatarSrc(m.full_name, m.avatar_url)}
                        label={m.full_name}
                        title={m.full_name}
                        style={{ ["--size" as any]: "36px" }}
                      />
                    ))}
                </div>

                {!teamLoading && <SlBadge pill>{team.length}</SlBadge>}

                {/* Create Task */}
               
            <SlButton
  size="small"
  variant="text"
  className="create-task-icon-btn"
  onClick={() => setIsTaskDialogOpen(true)}
>
  <SlIcon name="list-task" />
</SlButton>

                <ProjectDrawer projectId={activeProjectId!} />
              </div>
            </div>
          ) : (
            <div className="mv-placeholder">
              <SlIcon name="layout-split" />
              <div>Select a project from the left to view details.</div>
            </div>
          )}
          {activeProjectId && <TasksMasterDetail projectId={activeProjectId} />}
        </div>

        {/* DIALOGS */}
        <NewProjectDialog
          open={isNewProjectDialogOpen}
          onCancel={() => setIsNewProjectDialogOpen(false)}
          onCreate={(payload) => {
            setProjectList((prev) => [
              {
                id: payload.id,
                name: payload.name,
                location: payload.location,
                projectId: payload.projectId,
              },
              ...prev,
            ]);
            setActiveProjectId(payload.id);
            setIsNewProjectDialogOpen(false);
          }}
        />

        <SlDialog
          open={isTaskDialogOpen}
          label={activeProject ? `Create Task – ${activeProject.name}` : "Create Task"}
          onSlRequestClose={() => setIsTaskDialogOpen(false)}
          style={{
            ["--width" as any]: "80vw",
            ["--body-spacing" as any]: "16px",
          }}
        >
          {activeProject && (
            <ConstructionSiteReportForm
              activeProject={activeProjectPayload!}
              createdByName={currentUserName}
            />
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <SlButton variant="neutral" onClick={() => setIsTaskDialogOpen(false)}>
              <SlIcon name="x" />
              <span>Close</span>
            </SlButton>
          </div>
        </SlDialog>
      </section>
    </div>
  );
}

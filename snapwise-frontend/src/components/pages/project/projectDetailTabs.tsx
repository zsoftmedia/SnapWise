import React, { useState } from "react";
import {
  SlTab,
  SlTabGroup,
  SlTabPanel,
  SlIcon
} from "@shoelace-style/shoelace/dist/react";
import ProjectPlanEditor from "../../projectPlan/projectPlanEditor";
import TaskFolders from "../task/TasksMasterDetail";


export default function ProjectDetailTabs({ project }: { project: any }) {
  const [activeTab, setActiveTab] = useState("plan");

  return (
    <div className="project-tabs-root">
      <SlTabGroup onSlTabShow={(e: any) => setActiveTab(e.detail.name)}>
        <SlTab slot="nav" panel="details">
          <SlIcon name="info-circle" /> Project Details
        </SlTab>
        <SlTab slot="nav" panel="plan">
          <SlIcon name="map" /> Plan & Tasks
        </SlTab>

        <SlTabPanel name="details">
          <div className="pd-details">
            <h3>{project.project_name}</h3>
            <p><b>Project ID:</b> {project.project_readable_id}</p>
            <p><b>Location:</b> {project.location}</p>
            <p><b>Supervisor:</b> {project.supervisor || "—"}</p>
            <p><b>Created by:</b> {project.created_by_name}</p>
          </div>
        </SlTabPanel>

        <SlTabPanel name="plan">
          <div className="pd-plan-wrap">
            {project.planImageDataUrl ? (
              <ProjectPlanEditor
                projectId={project.id}
                projectReadableId={project.project_readable_id}
                projectName={project.project_name}
                location={project.location}
                planUrl={project.planImageDataUrl}
                supervisor={project.supervisor}
                allowGps={project.allow_gps}
                createdByName={project.created_by_name}
              />
            ) : (
              <div className="no-plan">No plan image attached.</div>
            )}

            {/* ✅ your component goes right here */}
            <TaskFolders  />
          </div>
        </SlTabPanel>
      </SlTabGroup>
    </div>
  );
}

import React, { useState, useRef } from "react";
import {
  SlButton,
  SlDrawer,
  SlDivider,
  SlBadge,
  SlIcon
} from "@shoelace-style/shoelace/dist/react";
import { useGetProjectsQuery } from "../../api/project/projectsApi";
import "./projectDrawer.css";

type Pin = {
  id: string;
  label: string;
  x: number;
  y: number;
};

type Props = {
  projectId: string;
};

export default function ProjectDrawer({ projectId }: Props) {
  const { data: projects } = useGetProjectsQuery();
  const project = projects?.find((p) => p.id === projectId);
  const [open, setOpen] = useState(false);
  const [pins, setPins] = useState<Pin[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <>
      <SlButton
        size="small"
        variant="text"
        className="project-detail-trigger"
        onClick={() => setOpen(true)}
      >
        <SlIcon name="layout-text-sidebar-reverse" />
      </SlButton>
      <SlDrawer
        label={`Project Details${project ? ` – ${project.name}` : ""}`}
        open={open}
        placement="end"
        onSlAfterHide={() => setOpen(false)}
      >
        {!project ? (
          <div>No project found.</div>
        ) : (
          <div className="project-drawer">
            <h3>{project.name}</h3>
            <p><strong>Location:</strong> {project.location}</p>
            <p><strong>Supervisor:</strong> {project.supervisor || "—"}</p>
            <p><strong>Work Type:</strong> {project.work_type || "—"}</p>
            <p><strong>Client:</strong> {project.client_name || "—"}</p>
            <p><strong>Budget:</strong> {project.budget_eur ? `${project.budget_eur} €` : "—"}</p>
            <p><strong>Start:</strong> {project.start_date || "—"}</p>
            <p><strong>End:</strong> {project.end_date || "—"}</p>
              <div className="plan-wrapper">
                <img
                  ref={imageRef}
                  src={project.plan_image_url!}
                  alt="Project Plan"
                  className="plan-img"
                />
              </div>
          </div>
        )}
      </SlDrawer>
    </>
  );
}

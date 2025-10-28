import React, { useState, useRef } from "react";
import {
  SlButton,
  SlDrawer,
  SlDivider,
  SlBadge,
  SlIcon
} from "@shoelace-style/shoelace/dist/react";
import { useGetProjectsQuery } from "../../api/project/projectsApi";

type Pin = {
  id: string;
  name: string;
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

  const handleAddPin = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = imageRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPin: Pin = {
      id: Math.random().toString(36).substring(2, 9),
      name: `Pin ${pins.length + 1}`,
      x,
      y
    };
    setPins((prev) => [...prev, newPin]);
  };

  const handleDeletePin = (id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      <SlButton
        variant="primary"
        onClick={() => setOpen(true)}
        size="small"
        style={{ marginBottom: "10px" }}
      >
        <SlIcon name="building" /> View Project Details
      </SlButton>

      <SlDrawer
        label={`Project Details${project ? ` – ${project.name}` : ""}`}
        open={open}
        onSlAfterHide={() => setOpen(false)}
        placement="end"
      >
        {project ? (
          <div className="project-drawer">
            <h3>{project.name}</h3>
            <SlDivider />
            <p><strong>Location:</strong> {project.location}</p>
            <p><strong>Supervisor:</strong> {project.supervisor || "—"}</p>
            <p><strong>Work Type:</strong> {project.work_type || "—"}</p>
            <p><strong>Client:</strong> {project.client_name || "—"}</p>
            <p><strong>Budget:</strong> {project.budget_eur ? `${project.budget_eur} €` : "—"}</p>
            <p><strong>Start:</strong> {project.start_date || "—"}</p>
            <p><strong>End:</strong> {project.end_date || "—"}</p>

            <SlDivider />

            <div style={{ marginBottom: "6px" }}>
              <strong>Blueprint / Plan:</strong>
            </div>

            {project.plan_image_url ? (
              <div
                className="plan-wrapper"
                onClick={handleAddPin}
                style={{
                  position: "relative",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  overflow: "hidden",
                  cursor: "crosshair"
                }}
              >
                <img
                  ref={imageRef}
                  src={project.plan_image_url}
                  alt="Project Plan"
                  className="plan-img"
                  style={{
                    width: "100%",
                    display: "block",
                    userSelect: "none"
                  }}
                />

                {pins.map((pin) => (
                  <div
                    key={pin.id}
                    style={{
                      position: "absolute",
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: "translate(-50%, -50%)",
                      background: "#2563eb",
                      color: "white",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      fontSize: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                    title={pin.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePin(pin.id);
                    }}
                  >
                    {pin.name.split(" ")[1]}
                  </div>
                ))}
              </div>
            ) : (
              <div className="tf-empty">No plan image uploaded yet.</div>
            )}

            {pins.length > 0 && (
              <>
                <SlDivider />
                <h4>Pins</h4>
                <ul>
                  {pins.map((p) => (
                    <li key={p.id}>
                      <SlBadge variant="primary">{p.name}</SlBadge>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          <div>No project found.</div>
        )}
      </SlDrawer>
    </>
  );
}

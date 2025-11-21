import React, { useState } from "react";
import {
  SlTab,
  SlTabGroup,
  SlTabPanel
} from "@shoelace-style/shoelace/dist/react";

import PlanPinBoard, { PlanPin } from "../PlanPinBoard/PlanPinBoard";
import TasksMasterDetail from "../task/TasksMasterDetail";
import { useGetProjectsQuery } from "../../../api/project/projectsApi";

type Props = {
  projectId: string;
  planUrl?: string | null;
};

export default function ProjectDetailTabs({ projectId, planUrl }: Props) {
  const [pins, setPins] = useState<PlanPin[]>([]);
  const [activePin, setActivePin] = useState<string | null>(null);
  const { data: projects } = useGetProjectsQuery();
  const project = projects?.find((p) => p.id === projectId);
  const handleAddPin = (newPin: PlanPin) => {
    setPins((prev) => [...prev, newPin]);
  };

  const handleDeletePin = (id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
  };

  const handleEditPin = (id: string) => {
    setActivePin(id);
    console.log(id)
  };

  return (
    <SlTabGroup style={{ width: "100%", height: "100%" }}>
      
      {/* ---------------------------
          LIST VIEW TAB
      ---------------------------- */}
      <SlTab slot="nav" panel="list">List View</SlTab>
      <SlTabPanel name="list">
        <TasksMasterDetail projectId={projectId} />
      </SlTabPanel>

      {/* ---------------------------
          PLAN VIEW TAB
      ---------------------------- */}
      <SlTab slot="nav" panel="plan" >
        Plan View
      </SlTab>

      <SlTabPanel name="plan" style={{ padding: 0, height: "100%", width: "100%" }}>
  {project ? (
    <div
      style={{
        width: "100%",
        height: "calc(90vh - 150px)",
        overflow: "hidden",
      }}
    >
      <PlanPinBoard
        imageUrl={project.plan_image_url!}
        pins={pins}
        activePinId={activePin}
        onAddPin={handleAddPin}
        onDeletePin={handleDeletePin}
        onEditPin={handleEditPin}
      />
    </div>
  ) : (
    <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
      No plan uploaded.
    </div>
  )}
</SlTabPanel>

    </SlTabGroup>
  );
}

import React, { useRef, useState } from "react";
import { SlButton, SlIcon, SlSpinner } from "@shoelace-style/shoelace/dist/react";
import { useGetProjectTasksQuery } from "../../api/task/taskApi";

import "./projectPlan.css";
import TaskPinDialog from "./taskPinDialog";

type Props = {
  projectId: string;
  projectReadableId: string;
  projectName: string;
  location: string;
  planUrl: string;
  supervisor?: string;
  allowGps?: boolean;
  createdByName: string;
};

export default function ProjectPlanEditor({
  projectId,
  projectReadableId,
  projectName,
  location,
  planUrl,
  supervisor,
  allowGps,
  createdByName
}: Props) {
  const { data: tasks, isLoading } = useGetProjectTasksQuery(projectId);
  const imgRef = useRef<HTMLImageElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [pinCoords, setPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const handleImageClick = (e: React.MouseEvent) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPinCoords({ x, y });
    setSelectedTask(null);
    setOpenDialog(true);
  };

  return (
    <div className="plan-editor-root">
      <div className="plan-toolbar">
        <SlButton size="small" variant="default">
          <SlIcon name="arrow-left" /> Back
        </SlButton>
        <SlButton size="small" variant="primary" onClick={() => setOpenDialog(true)}>
          <SlIcon name="plus-lg" /> Create Task
        </SlButton>
      </div>

      <div className="plan-image-wrap">
        {isLoading && (
          <div className="plan-loading">
            <SlSpinner /> Loading plan...
          </div>
        )}
        {!isLoading && (
          <>
            <img
              ref={imgRef}
              src={planUrl}
              alt="Project Plan"
              className="plan-image"
              onClick={handleImageClick}
            />

            {tasks?.map((task, index) => (
              <div
                key={task.id}
                className="plan-pin"
                style={{
                  left: `${(task.room ? Number(task.room) : 0.5) * 100}%`,
                  top: `${(task.floor ? Number(task.floor) : 0.5) * 100}%`,
                }}
                title={task.work_package || task.project_name}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTask(task.id);
                  setOpenDialog(true);
                }}
              >
                <div className="plan-pin-icon">
                  <SlIcon name="geo-alt-fill" />
                </div>
                <span className="plan-pin-label">{index + 1}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {openDialog && (
        <TaskPinDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          projectId={projectId}
          projectReadableId={projectReadableId}
          projectName={projectName}
          location={location}
          supervisor={supervisor}
          allowGps={!!allowGps}
          createdByName={createdByName}
          pin={pinCoords}
          existingTaskId={selectedTask}
        />
      )}
    </div>
  );
}

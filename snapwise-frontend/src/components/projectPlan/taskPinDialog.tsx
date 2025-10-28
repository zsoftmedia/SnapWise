import React, { useState } from "react";
import {
  SlButton,
  SlDialog,
  SlIcon,
  SlInput,
  SlTextarea,
  SlBadge
} from "@shoelace-style/shoelace/dist/react";
import { useCreateTaskMutation } from "../../api/task/taskApi";

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectReadableId: string;
  projectName: string;
  location: string;
  supervisor?: string;
  allowGps: boolean;
  createdByName: string;
  pin: { x: number; y: number } | null;
  existingTaskId?: string | null;
};

export default function TaskPinDialog({
  open,
  onClose,
  projectId,
  projectReadableId,
  projectName,
  location,
  supervisor,
  allowGps,
  createdByName,
  pin,
  existingTaskId
}: Props) {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [workPackage, setWorkPackage] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!pin) return;
    const body = {
      project_id: projectId,
      project_readable_id: projectReadableId,
      project_name: projectName,
      location,
      supervisor,
      allow_gps: allowGps,
      created_by_name: createdByName,
      work_package: workPackage,
      notes,
      area: `${(pin.x * 100).toFixed(1)}%`,
      floor: `${(pin.y * 100).toFixed(1)}%`,
      photos: []
    };
    try {
      await createTask(body).unwrap();
      onClose();
    } catch (err) {
      console.error("Error creating task", err);
    }
  };

  return (
    <SlDialog
      open={open}
      label={existingTaskId ? "Edit Task" : "Create Task"}
      onSlRequestClose={onClose}
    >
      <div className="task-dialog-body">
        <div className="task-pin-header">
          <SlBadge pill>Pin X: {(pin?.x ?? 0).toFixed(2)} | Y: {(pin?.y ?? 0).toFixed(2)}</SlBadge>
        </div>

        <label>Task / Work Package</label>
        <SlInput
          value={workPackage}
          placeholder="e.g., Wall Repair"
          onSlChange={(e: any) => setWorkPackage(e.target.value)}
        />

        <label>Notes</label>
        <SlTextarea
          rows={3}
          placeholder="Add details about this task..."
          value={notes}
          onSlChange={(e: any) => setNotes(e.target.value)}
        />

        <div className="task-pin-footer">
          <SlButton size="small" variant="default" onClick={onClose}>
            <SlIcon name="x" /> Cancel
          </SlButton>
          <SlButton
            size="small"
            variant="primary"
            disabled={!workPackage || isLoading}
            onClick={handleSave}
          >
            <SlIcon name={isLoading ? "hourglass-split" : "check2"} />{" "}
            {isLoading ? "Saving..." : "Save"}
          </SlButton>
        </div>
      </div>
    </SlDialog>
  );
}

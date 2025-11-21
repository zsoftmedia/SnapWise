import React, { useRef } from "react";
import { SlButton, SlIcon } from "@shoelace-style/shoelace/dist/react";
import "./planView.css";
export type TaskRow = {
  id: string;
  work_package: string | null;   // CAN BE null ❗
  project_name: string;
  area: string | null;
  floor: string | null;
 
}

type Props = {
  tasks: TaskRow[];                          // <-- FIXED
  onSelectTask: (taskId: string) => void;    // <-- FIXED
  onOpenFullscreen: () => void;
};

export default function PlanView({ tasks, onSelectTask, onOpenFullscreen }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div className="pv-root">
      <div className="pv-toolbar">
        <div className="pv-title">
          <SlIcon name="map" /> Project Plan
        </div>

        <SlButton size="small" variant="primary" onClick={onOpenFullscreen}>
          <SlIcon name="arrows-fullscreen" /> Fullscreen
        </SlButton>
      </div>

      <div className="pv-wrapper" ref={wrapperRef}>
        <img src="/images/blueprint-placeholder.png" alt="Project Plan" className="pv-image" />

        {tasks.map((task, index) => {
          const x = task.area ? Number(task.area) : null;
          const y = task.floor ? Number(task.floor) : null;

          if (x === null || y === null) return null;

          return (
            <div
              key={task.id}
              className="pv-pin"
              style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              onClick={() => onSelectTask(task.id)}
            >
              <div className="pv-pin-circle">{index + 1}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

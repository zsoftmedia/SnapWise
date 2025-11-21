import React, { useEffect, useMemo, useState } from "react";
import "./taksMasterDetail.css";
import {
  useGetProjectTasksQuery,
  useGetTaskQuery,
} from "../../../api/task/taskApi";
import { supabase } from "../../../lib/supabase";
import TaskList, { FolderCard } from "./taskList";
import TaskDetail from "./taskDetails";

export default function TaskFolders({
  projectId,
}: {
  projectId?: string | null;
}) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /* ======================================================
     1) LOAD USER ID FROM SUPABASE
  ======================================================= */
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    })();
  }, []);

  /* ======================================================
     2) SAFE FETCH — ONLY WHEN projectId + userId EXIST
  ======================================================= */
  const canFetch = Boolean(projectId && userId);

  const {
    data: tasks,
    isFetching: loadingList,
    error: tasksError,
  } = useGetProjectTasksQuery(projectId ?? "", {
    skip: !canFetch,
  });

  /* ======================================================
     3) FETCH SINGLE TASK (DETAIL)
  ======================================================= */
  const {
    data: taskData,
    isFetching: loadingDetail,
    error: detailError,
  } = useGetTaskQuery(activeTaskId ?? "", {
    skip: !activeTaskId,
  });

  /* ======================================================
     4) TRANSFORM TASKS → FOLDERS
  ======================================================= */
  const folders: FolderCard[] = useMemo(() => {
    if (!tasks) return [];
    return tasks.map((t: any) => ({
      id: t.id,
      room: t.room || "—",
      taskName: t.work_package || t.project_name,
      createdBy: t.created_by_name || "—",
      createdAt: t.created_at,
      badges: [
        t.area ? `Area ${t.area}` : "",
        t.floor ? `Fl ${t.floor}` : "",
      ].filter(Boolean),
    }));
  }, [tasks]);

  /* ======================================================
     5) GROUP PHOTOS INTO BEFORE/AFTER PAIRS
  ======================================================= */
  const buildPairs = (photos: any[]) => {
    const byPair = new Map<string, any[]>();
    for (const p of photos || []) {
      if (!p.pair_id) continue;
      const arr = byPair.get(p.pair_id) || [];
      arr.push(p);
      byPair.set(p.pair_id, arr);
    }
    return Array.from(byPair.entries()).map(([pairId, arr]) => ({
      pairId,
      before: arr.find((p) => p.phase === "before"),
      after: arr.find((p) => p.phase === "after"),
    }));
  };

  const photoPairs = useMemo(() => {
    if (!taskData?.photos) return [];
    return buildPairs(taskData.photos);
  }, [taskData?.photos]);

  /* ======================================================
     6) RENDER
  ======================================================= */

  if (!projectId) {
    return <div className="tf-root">No project selected.</div>;
  }

  if (!userId) {
    return <div className="tf-root">Loading user...</div>;
  }

  return (
    <div className="tf-root">
      {/* LEFT: LIST */}
      <TaskList
        loading={loadingList}
        folders={folders}
        activeTaskId={activeTaskId}
        onSelect={setActiveTaskId}
      />

      {/* RIGHT: TASK DETAIL */}
      <TaskDetail
        taskData={taskData}
        photoPairs={photoPairs}
        loading={loadingDetail}
        onBack={() => setActiveTaskId(null)}
        projectId={projectId}
      />
    </div>
  );
}

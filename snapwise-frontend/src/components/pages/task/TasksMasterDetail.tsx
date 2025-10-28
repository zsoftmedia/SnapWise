import React, { useEffect, useMemo, useState } from "react";
import "./taksMasterDetail.css";
import { useGetProjectTasksQuery, useGetTaskQuery } from "../../../api/task/taskApi";
import { supabase } from "../../../lib/supabase"; // ✅ import Supabase client
import TaskList, { FolderCard } from "./taskList";
import TaskDetail from "./taskDetails";

export default function TaskFolders({ projectId }: { projectId?: string | null }) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Fetch active user once
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    })();
  }, []);

  // ✅ fetch tasks only when both projectId and userId are available
  const { data: tasks, isFetching: loadingList } = useGetProjectTasksQuery(projectId!, {
    skip: !projectId || !userId,
  });

  const { data: taskData, isFetching: loadingDetail } = useGetTaskQuery(activeTaskId || "", {
    skip: !activeTaskId,
  });

  const folders: FolderCard[] = useMemo(() => {
    if (!tasks) return [];
    return tasks.map((t: any) => ({
      id: t.id,
      room: t.room || "—",
      taskName: t.work_package || t.project_name,
      createdBy: t.created_by_name || "—",
      createdAt: t.created_at,
      badges: [t.area ? `Area ${t.area}` : "", t.floor ? `Fl ${t.floor}` : ""].filter(Boolean),
    }));
  }, [tasks]);

  const buildPairs = (photos: any[]) => {
    const byPair = new Map<string, any[]>();
    for (const p of photos || []) {
      if (!p.pair_id) continue;
      const arr = byPair.get(p.pair_id) || [];
      arr.push(p);
      byPair.set(p.pair_id, arr);
    }
    const pairs: any[] = [];
    for (const [pairId, arr] of byPair.entries() as any) {
      const before = arr.find((p: any) => p.phase === "before");
      const after = arr.find((p: any) => p.phase === "after");
      pairs.push({ pairId, before, after });
    }
    return pairs;
  };

  const photoPairs = useMemo(() => {
    if (!taskData?.photos) return [];
    return buildPairs(taskData.photos);
  }, [taskData?.photos]);

  return (
    <div className="tf-root">
      <TaskList
        loading={loadingList}
        folders={folders}
        activeTaskId={activeTaskId}
        onSelect={setActiveTaskId}
      />
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

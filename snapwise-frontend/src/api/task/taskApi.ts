import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../lib/supabase";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/api";

/* ---------------------- TYPES ---------------------- */
export type CreateTaskBody = {
  project_id: string;
  project_readable_id: string;
  project_name: string;
  location: string;
  area?: string | null;
  floor?: string | null;
  room?: string | null;
  work_package?: string | null;
  supervisor?: string | null;
  allow_gps: boolean;
  notes?: string | null;
  created_by?: string | null; 
  created_by_name: string;
  photos: Array<{
    id: string;
    fileName: string;
    dataUrl?: string;
    mimeType?: string;
    size?: number;
    phase: "before" | "after" | "other";
    status: "not_started" | "in_progress" | "blocked" | "finished";
    description?: string;
    employeesOnTask: number;
    materials: string[];
    startedAt?: string | null;
    finishedAt?: string | null;
    durationMins: number;
    locationTag?: string | null;
    capturedAt?: string;
    captureGroupId?: string;
    spot_id?: string;
    pair_id?: string | null;
  }>;
};

export type TaskRow = {
  id: string;
  project_id: string;
  project_readable_id: string;
  project_name: string;
  location: string;
  area: string | null;
  floor: string | null;
  room: string | null;
  work_package: string | null;
  supervisor: string | null;
  allow_gps: boolean;
  notes: string | null;
  created_by: string | null;
  created_by_name: string;
  created_at: string;
};

export type TaskPhotoRow = {
  id: string;
  task_id: string;
  photo_client_id: string;
  file_name: string;
  storage_url: string | null;
  url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  phase: "before" | "after" | "other";
  status: "not_started" | "in_progress" | "blocked" | "finished";
  description: string | null;
  employees_on_task: number;
  materials: string[];
  started_at: string | null;
  finished_at: string | null;
  duration_mins: number;
  location_tag: string | null;
  captured_at: string;
  capture_group_id: string;
  spot_id: string | null;
  created_at: string;
  pair_id: string | null;
};

/* ---------------------- API ---------------------- */
export const taskApi = createApi({
  reducerPath: "taskApi",

  /* ✅ ADD THE TOKEN HERE */
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: async (headers) => {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["Tasks", "TaskDetail"],

  endpoints: (builder) => ({
    /** CREATE TASK */
    createTask: builder.mutation<
      { ok: boolean; task: { id: string; photos: number } },
      CreateTaskBody
    >({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: "Tasks", id: body.project_id },
      ],
    }),

    /** LIST TASKS */
    getProjectTasks: builder.query<TaskRow[], string>({
      query: (projectId) => `/projects/${projectId}/tasks`,
      providesTags: (_res, _err, projectId) => [
        { type: "Tasks", id: projectId },
      ],
    }),

    /** GET SINGLE TASK */
    getTask: builder.query<
      { task: TaskRow | null; photos: TaskPhotoRow[] },
      string
    >({
      query: (taskId) => `/tasks/${taskId}`,
      providesTags: (_res, _err, taskId) => [
        { type: "TaskDetail", id: taskId },
      ],
    }),
  }),
});

/* ---------------------- HOOKS ---------------------- */
export const {
  useCreateTaskMutation,
  useGetProjectTasksQuery,
  useGetTaskQuery,
} = taskApi;

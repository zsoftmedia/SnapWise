import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../lib/supabase";

/* ========= Base URL ========= */
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/api";

/* ========= Types ========= */

export type CreateProjectBody = {
  name: string;
  location: string;
  projectId: string;
  startDate?: string;
  endDate?: string;
  supervisor?: string;
  workType?:
    | "renovation"
    | "new_build"
    | "maintenance"
    | "electrical"
    | "plumbing"
    | "masonry"
    | "other";
  notes?: string;
  planImageDataUrl?: string;
  allowGps: boolean;
  clientName?: string;
  budgetEUR?: number;
  created_by?: string; // Supabase user ID
  teamMembers?: Array<{
    id: string;
    fullName: string;
    avatarUrl?: string;
    phone?: string;
    email?: string;
    userId?: string;
  }>;
};

export type CreateProjectResponse = {
  ok: boolean;
  project: {
    id: string;
    plan_image_url: string | null;
  };
};

export type ProjectRow = {
  id: string;
  name: string;
  location: string;
  project_id: string;
  start_date?: string | null;
  end_date?: string | null;
  supervisor?: string | null;
  work_type?: string | null;
  notes?: string | null;
  plan_image_url?: string | null;
  allow_gps?: boolean;
  client_name?: string | null;
  budget_eur?: number | null;
  created_at: string;
};

export type TeamMemberRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  user_id_external: string | null;
};

/* ========= API ========= */

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    // ✅ Attach Supabase token to every request
    prepareHeaders: async (headers) => {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Projects", "ProjectTeam"],

  endpoints: (builder) => ({
    /* ========= GET /api/projects ========= */
   getProjects: builder.query<ProjectRow[], string | void>({
  query: (userId) => ({
    url: userId ? `/projects?userId=${userId}` : "/projects",
    method: "GET",
  }),
  transformResponse: (response: { ok: boolean; data: ProjectRow[] }) =>
    response.data ?? [],
  providesTags: ["Projects"],
}),

    /* ========= POST /api/projects ========= */
    createProject: builder.mutation<CreateProjectResponse, CreateProjectBody>({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Projects"],
    }),

    /* ========= GET /api/projects/:id/team ========= */
    getProjectTeamMembers: builder.query<TeamMemberRow[], string>({
  query: (projectId) => ({
    url: `/projects/${projectId}/team`,
    method: "GET",
  }),
  transformResponse: (response: { ok: boolean; data: TeamMemberRow[] }) =>
    response.data ?? [],
  providesTags: (_result, _error, id) => [{ type: "ProjectTeam", id }],
}),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetProjectTeamMembersQuery,
} = projectsApi;

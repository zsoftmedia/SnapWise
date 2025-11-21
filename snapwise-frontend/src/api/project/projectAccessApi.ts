// src/api/project/projectAccessApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type AccessCreatePayload = {
  employee_id: string;
  project_id: string;
  can_view: boolean;
  can_edit: boolean;
  can_manage_tasks: boolean;
  can_manage_team: boolean;
};

export type AccessUpdatePayload = {
  id: string;
  can_view?: boolean;
  can_edit?: boolean;
  can_manage_tasks?: boolean;
  can_manage_team?: boolean;
};

export const projectAccessApi = createApi({
  reducerPath: "projectAccessApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api/" }),
  tagTypes: ["ProjectAccess"],

  endpoints: (builder) => ({
    getAccess: builder.query({
      query: (employeeId: string) => `access/${employeeId}`,
      providesTags: ["ProjectAccess"],
    }),

    // CREATE ACCESS
    createAccess: builder.mutation<any, AccessCreatePayload>({
      query: (body) => ({
        url: "access",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProjectAccess"],
    }),

    // UPDATE ACCESS
    updateAccess: builder.mutation<any, AccessUpdatePayload>({
      query: ({ id, ...body }) => ({
        url: `access/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ProjectAccess"],
    }),

    deleteAccess: builder.mutation({
      query: (id: string) => ({
        url: `access/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProjectAccess"],
    }),
  }),
});

export const {
  useGetAccessQuery,
  useCreateAccessMutation,
  useUpdateAccessMutation,
  useDeleteAccessMutation
} = projectAccessApi;

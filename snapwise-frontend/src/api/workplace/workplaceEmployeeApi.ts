import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../lib/supabase";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export const workplaceEmployeeApi = createApi({
  reducerPath: "workplaceEmployeeApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,

    prepareHeaders: async (headers) => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["Employees"],

  endpoints: (builder) => ({
    getEmployeesByWorkplace: builder.query({
      query: (workplaceId: string) => `/workplaces/${workplaceId}/employees`,
      providesTags: ["Employees"],
    }),

    generateInviteLink: builder.mutation({
      query: (payload) => ({
        url: `/workplaces/${payload.workplace_id}/invite`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Employees"],
    }),
  }),
});

export const {
  useGetEmployeesByWorkplaceQuery,
  useGenerateInviteLinkMutation,
} = workplaceEmployeeApi;

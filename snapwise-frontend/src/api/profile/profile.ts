import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../lib/supabase";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/api";

/* ========= Types ========= */

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
  workplace_id: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateProfileBody = {
  full_name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  workplace_id?: string;
};

/* ========= API ========= */

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: async (headers) => {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Profile"],

  endpoints: (builder) => ({
    /* ========= GET /api/profiles/me ========= */
    getMyProfile: builder.query<Profile, void>({
      query: () => "/profiles/me",

      transformResponse: (res: any) => {
        console.log("PROFILE RESPONSE →", res);

        return (
          res?.profile ||     // { ok, profile: {...} }
          res?.data ||        // { ok, data: {...} }
          res || {}           // fallback
        );
      },

      providesTags: ["Profile"],
    }),

    /* ========= PUT /api/profiles/me ========= */
    updateMyProfile: builder.mutation<Profile, UpdateProfileBody>({
      query: (body) => ({
        url: "/profiles/me",
        method: "PUT",
        body,
      }),

      transformResponse: (res: any) => {
        console.log("UPDATE PROFILE RESPONSE →", res);

        return (
          res?.profile ||    
          res?.data ||        
          res || {}
        );
      },

      invalidatesTags: ["Profile"],
    }),

    /* ========= DELETE /api/profiles/me ========= */
    deleteMyProfile: builder.mutation<{ ok: boolean; message: string }, void>({
      query: () => ({
        url: "/profiles/me",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useDeleteMyProfileMutation,
} = profileApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const inviteApi = createApi({
  reducerPath: "inviteApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api/auth/" }),
  endpoints: (builder) => ({
    validateInvite: builder.query({
      query: (token: string) => `invite/${token}`,
    }),
    completeInvite: builder.mutation({
      query: (body) => ({
        url: "invite/complete",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useValidateInviteQuery, useCompleteInviteMutation } = inviteApi;

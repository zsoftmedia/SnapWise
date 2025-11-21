import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const rolesApi = createApi({
  reducerPath: "rolesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api/" }),
  tagTypes: ["Roles"],

  endpoints: (builder) => ({
    getRoles: builder.query<any, void>({
      query: () => "roles",
      providesTags: ["Roles"],
    }),
  }),
});

export const { useGetRolesQuery } = rolesApi;

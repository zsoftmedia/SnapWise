import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const workplaceApi = createApi({
  reducerPath: "workplaceApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api/" }),
  tagTypes: ["Workplaces"],
  endpoints: (builder) => ({
    createWorkplace: builder.mutation({
      query: (body) => ({
        url: "workplaces",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Workplaces"],
    }),

    getWorkplacesByUser: builder.query({
      query: (userId) => `workplaces?userId=${userId}`,
      providesTags: ["Workplaces"],
    }),

    updateWorkplace: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `workplaces/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Workplaces"],
    }),
  }),
});

export const {
  useCreateWorkplaceMutation,
  useGetWorkplacesByUserQuery,
  useUpdateWorkplaceMutation,
} = workplaceApi;

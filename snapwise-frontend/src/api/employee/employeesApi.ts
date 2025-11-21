import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const employeesApi = createApi({
  reducerPath: "employeesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api/" }),
  tagTypes: ["Employees"],
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: (workplaceId: string) => `employees/${workplaceId}`,
      providesTags: ["Employees"],
    }),
    createEmployee: builder.mutation({
      // 👇 use FormData, not JSON
      query: (formData: FormData) => ({
        url: "employees",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Employees"],
    }),
    updateEmployee: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `employees/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Employees"],
    }),
    deleteEmployee: builder.mutation({
      query: (id: string) => ({
        url: `employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employees"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeesApi;

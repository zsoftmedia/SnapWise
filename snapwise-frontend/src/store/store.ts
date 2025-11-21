// src/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { projectsApi } from "../api/project/projectsApi";
import { taskApi } from "../api/task/taskApi";
import { workplaceApi } from "../api/workplace/workplaceApi";
import { workplaceEmployeeApi } from "../api/workplace/workplaceEmployeeApi";
import { employeesApi } from "../api/employee/employeesApi";
import { rolesApi } from "../api/roles/roles";
import { projectAccessApi } from "../api/project/projectAccessApi";
import { inviteApi } from "../api/employee/invateApi";
import { profileApi } from "../api/profile/profile";

export const store = configureStore({
  reducer: {
    [projectsApi.reducerPath]: projectsApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [workplaceApi.reducerPath]: workplaceApi.reducer,
    [workplaceEmployeeApi.reducerPath]: workplaceEmployeeApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [projectAccessApi.reducerPath]: projectAccessApi.reducer,
    [inviteApi.reducerPath]: inviteApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
   

  },
  middleware: (getDefault) =>
    getDefault().concat(
      projectsApi.middleware,
      taskApi.middleware,
      workplaceApi.middleware,
      workplaceEmployeeApi.middleware,
     employeesApi.middleware,
     rolesApi.middleware,
     projectAccessApi.middleware,
     inviteApi.middleware,
     profileApi.middleware,

    ),
});

export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

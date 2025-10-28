// src/store.ts
import { configureStore } from "@reduxjs/toolkit";

// Keep your existing APIs (adjust the paths to match your project)
import { projectsApi } from "../api/project/projectsApi";
import { taskApi } from "../api/task/taskApi";


export const store = configureStore({
  reducer: {
    [projectsApi.reducerPath]: projectsApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(projectsApi.middleware, taskApi.middleware)
});

export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";

import projectsRouter from "./routes/projects/newProject";
import spotsRouter from "./routes/projects/spots/spots";
import tasksRouter from "./routes/tasks/tasks";
import workplaceRouter from "./routes/workplace/workplace";
import employeesRouter from "./routes/employee/employee";
import rolesRouter from "./routes/roles/roles";
import projectAccessRouter from "./routes/projectAccess/projectAccess";
import authRoutes from "./routes/auth/auth"; 
import profileRout from "./routes/profile/profile";

import { env } from "./utils/env";

const app = express();

// CORS SETUP
const corsOrigins = env.APP_ORIGIN.split(",").map(s => s.trim());
app.use(cors({ origin: corsOrigins, credentials: true }));

app.use(express.json({ limit: "10mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// ---------------------------
// 🔐 AUTH ROUTES
// ---------------------------
app.use("/api/auth", authRoutes);  // <<<<<<<< CORRECT MOUNT
// Now frontend uses: GET /api/auth/invite/:token

// ---------------------------
// API ROUTES
// ---------------------------
app.use("/api", rolesRouter);
app.use("/api", projectsRouter);
app.use("/api", spotsRouter);
app.use("/api", tasksRouter);
app.use("/api/workplaces", workplaceRouter);
app.use("/api", employeesRouter);
app.use("/api", projectAccessRouter);
app.use("/api/profiles", profileRout);

// ERROR HANDLER
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ ok: false, error: "Internal error" });
});

// 404 FALLBACK
app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));

app.listen(env.PORT, () => {
  console.log(`API on http://localhost:${env.PORT} (origin: ${env.APP_ORIGIN})`);
});

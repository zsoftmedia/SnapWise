import { Router } from "express";
import {
  createTask,
  getTask,
  listProjectTasks,
} from "../../controllers/project/tasks/tasks";
import { requireAuth } from "../../utils/middleware/requireAuth";

const router = Router();

// Create new task
router.post("/tasks", requireAuth, createTask);

// Get all tasks for a project
router.get("/projects/:projectId/tasks", requireAuth, listProjectTasks);

// Get single task details
router.get("/tasks/:taskId", requireAuth, getTask);

export default router;

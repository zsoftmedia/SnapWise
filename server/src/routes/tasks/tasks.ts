import { Router } from "express";
import { createTask, getTask, listProjectTasks } from "../../controllers/project/tasks/tasks";

const router = Router();

router.post("/tasks", createTask);
router.get("/projects/:projectId/tasks", listProjectTasks);
router.get("/tasks/:taskId", getTask);

export default router;

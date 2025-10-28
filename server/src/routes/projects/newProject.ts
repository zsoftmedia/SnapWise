import { Router } from "express";
import { listProjects, listProjectTeam } from "../../controllers/project/listProjects";
import { createProject } from "../../controllers/project/projects";
import { requireAuth } from "../../utils/middleware/requireAuth";

const router = Router();
router.get("/projects", requireAuth, listProjects);
router.get("/projects/:id/team", requireAuth, listProjectTeam);
router.post("/projects", requireAuth, createProject);
export default router;

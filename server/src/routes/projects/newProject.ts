import { Router } from "express";
import { requireAuth } from "../../utils/middleware/requireAuth";
import { createProject, listProjects, listProjectTeam } from "../../controllers/project/listProjects";


const router = Router();

router.post("/projects", requireAuth, createProject);
router.get("/projects", requireAuth, listProjects);
router.get("/projects/:id/team", requireAuth, listProjectTeam);

export default router;

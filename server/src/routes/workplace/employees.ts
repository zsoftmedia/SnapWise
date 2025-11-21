import { Router } from "express";
import {
  generateInviteLink,
  verifyEmployeeInvite,
  acceptEmployeeInvite,
  getEmployees,
} from "../../controllers/workplace/employees";

const router = Router();

// POST /api/workplaces/:workplaceId/invite
router.post("/:workplaceId/invite", generateInviteLink);

// GET /api/workplaces/invite/:token
router.get("/invite/:token", verifyEmployeeInvite);

// POST /api/workplaces/invite/accept
router.post("/invite/accept", acceptEmployeeInvite);

// GET /api/workplaces/:workplaceId/employees
router.get("/:workplaceId/employees", getEmployees);

export default router;

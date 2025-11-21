import { Router } from "express";
import { getRoles } from "../../controllers/roles/roles";

const router = Router();

router.get("/roles", getRoles);   

export default router;

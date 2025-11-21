import express from "express";
import { createAccess, deleteAccess, getEmployeeAccess, updateAccess } from "../../controllers/project/projectAccess/projectAccess";

const router = express.Router();

router.post("/access", createAccess);
router.get("/access/:employeeId", getEmployeeAccess);
router.put("/access/:id", updateAccess);
router.delete("/access/:id", deleteAccess);

export default router;

import express from "express";
import { createWorkplace, listUserWorkplaces } from "../../controllers/workplace/workplace";


const router = express.Router();

// Create a new workplace
router.post("/", createWorkplace);

// Get workplaces created by user
router.get("/", listUserWorkplaces);

export default router;

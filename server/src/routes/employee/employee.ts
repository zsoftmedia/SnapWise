import express from "express";
import multer from "multer";
import { createEmployee, deleteEmployee, fetchEmployees, updateEmployee } from "../../controllers/employees/empolyees";


const router = express.Router();

// ✅ Configure multer for in-memory upload (best for Supabase storage)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Routes

// Create new employee (supports avatar upload)
router.post("/employees", upload.single("avatar"), createEmployee);

// Get all employees for a specific workplace
router.get("/employees/:workplace_id", fetchEmployees);

// Update employee (also supports avatar upload)
router.put("/employees/:id", upload.single("avatar"), updateEmployee);

// Delete employee
router.delete("/employees/:id", deleteEmployee);

export default router;

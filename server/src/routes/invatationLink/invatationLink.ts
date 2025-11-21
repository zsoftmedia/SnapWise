import { Router } from "express";
import { checkInvite, completeInvite } from "../../controllers/employees/invatationLink";


const router = Router();

router.get("/invite/:token", checkInvite);
router.post("/invite/complete", completeInvite);

export default router;

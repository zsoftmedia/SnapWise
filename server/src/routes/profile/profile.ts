import express from "express";
import { requireAuth } from "../../utils/middleware/requireAuth";
import { deleteMyProfile, getAllProfiles, getMyProfile, updateMyProfile } from "../../controllers/profile/profile";


const router = express.Router();

// must be authenticated
router.use(requireAuth);

/* ========= ROUTES ========= */
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.delete("/me", deleteMyProfile);

// optional: admin only
router.get("/", getAllProfiles);

export default router;

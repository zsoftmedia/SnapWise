import { Router } from "express";
import { createSpot, listSpots } from "../../../controllers/project/sports/spots";
import { addPhotoToSpot, listPhotosBySpot } from "../../../controllers/project/formPhotos/photos";


const router = Router();

// SPOTS
router.post("/spots", createSpot);
router.get("/projects/:projectId/spots", listSpots);

// PHOTOS
router.post("/spots/:spotId/photos", addPhotoToSpot); 
router.get("/spots/:spotId/photos", listPhotosBySpot);

export default router;

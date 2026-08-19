import express from "express";

import {
   addLocation,
   deleteLocation,
   getLocationById,
   getLocations,
   updateLocation,
} from "../controllers/location.controller.js";
import { requireAdmin, requireAuth } from "../middleware/requireAuth.js";
import {
   createImageUploadSignature,
   deleteLocationImage,
   reorderLocationImages,
   saveUploadedImage,
   updateLocationImage,
} from "../controllers/locationImage.controller.js";

const router = express.Router();

// Router to get all locations
router.get("/", getLocations);

// Router to get a single location
router.get("/:id", getLocationById);

// Router to Add Location
router.post("/", requireAuth, addLocation);

router.post("/:id/images/signature", requireAuth, requireAdmin, createImageUploadSignature);
router.post("/:id/images", requireAuth, requireAdmin, saveUploadedImage);
router.patch("/:id/images/order", requireAuth, requireAdmin, reorderLocationImages);
router.patch("/:id/images/:imageId", requireAuth, requireAdmin, updateLocationImage);
router.delete("/:id/images/:imageId", requireAuth, requireAdmin, deleteLocationImage);

// Router to Update Location
router.put("/:id", requireAuth, updateLocation);

// Router to Delete Location
router.delete("/:id", requireAuth, deleteLocation);

export default router;

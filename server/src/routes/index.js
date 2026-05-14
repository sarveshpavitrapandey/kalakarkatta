import { Router } from "express";
import eventRoutes from "./events.routes.js";
import creatorRoutes from "./creators.routes.js";
import storyRoutes from "./stories.routes.js";
import resourceRoutes from "./resources.routes.js";

const router = Router();

router.use("/events", eventRoutes);
router.use("/creators", creatorRoutes);
router.use("/stories", storyRoutes);
router.use("/resources", resourceRoutes);

export default router;



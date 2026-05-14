import { Router } from "express";
import { z } from "zod";
import Story from "../models/Story.js";
import { buildCrudController } from "../controllers/crudFactory.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();
const controller = buildCrudController(Story);

const storySchema = z.object({
  tag: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  href: z.string().url().optional(),
  linkLabel: z.string().optional(),
});

const partialStorySchema = storySchema.partial();

router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", validateRequest(storySchema), controller.create);
router.put("/:id", validateRequest(partialStorySchema), controller.update);
router.delete("/:id", controller.remove);

export default router;



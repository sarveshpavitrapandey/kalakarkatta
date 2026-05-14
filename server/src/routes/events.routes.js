import { Router } from "express";
import { z } from "zod";
import Event from "../models/Event.js";
import { buildCrudController } from "../controllers/crudFactory.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();
const controller = buildCrudController(Event);

const eventSchema = z.object({
  tag: z.string().min(1),
  tagLabel: z.string().min(1),
  title: z.string().min(1),
  date: z.string().min(1),
  description: z.string().min(1),
  cta: z.string().min(1),
  location: z.string().optional(),
});

const partialEventSchema = eventSchema.partial();

router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", validateRequest(eventSchema), controller.create);
router.put("/:id", validateRequest(partialEventSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;



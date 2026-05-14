import { Router } from "express";
import { z } from "zod";
import Resource from "../models/Resource.js";
import { buildCrudController } from "../controllers/crudFactory.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();
const controller = buildCrudController(Resource);

const resourceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  bullets: z.array(z.string()).default([]),
  linkLabel: z.string().optional(),
  href: z.string().optional(),
});

const partialResourceSchema = resourceSchema.partial();

router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", validateRequest(resourceSchema), controller.create);
router.put("/:id", validateRequest(partialResourceSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;



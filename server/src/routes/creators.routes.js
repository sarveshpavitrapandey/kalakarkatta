import { Router } from "express";
import { z } from "zod";
import Creator from "../models/Creator.js";
import { buildCrudController } from "../controllers/crudFactory.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();
const controller = buildCrudController(Creator);

const creatorSchema = z.object({
  name: z.string().min(1),
  discipline: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url(),
  alt: z.string().optional(),
  linkLabel: z.string().optional(),
  linkHref: z.string().optional(),
  buttonLabel: z.string().optional(),
});

const partialCreatorSchema = creatorSchema.partial();

router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", validateRequest(creatorSchema), controller.create);
router.put("/:id", validateRequest(partialCreatorSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;



import asyncHandler from "../utils/asyncHandler.js";

export const buildCrudController = (Model) => ({
  list: asyncHandler(async (_req, res) => {
    const docs = await Model.find().sort({ createdAt: -1 });
    res.json(docs);
  }),
  get: asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }
    res.json(doc);
  }),
  create: asyncHandler(async (req, res) => {
    const payload = req.validatedBody || req.body;
    const doc = await Model.create(payload);
    res.status(201).json(doc);
  }),
  update: asyncHandler(async (req, res) => {
    const payload = req.validatedBody || req.body;
    const doc = await Model.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }
    res.json(doc);
  }),
  remove: asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(204).send();
  }),
});



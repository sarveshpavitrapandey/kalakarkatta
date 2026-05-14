export const validateRequest = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.validatedBody = parsed;
    next();
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};



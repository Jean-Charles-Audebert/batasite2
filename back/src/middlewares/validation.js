const Joi = require("joi");

/* ----------------------------------
   Auth Validation
---------------------------------- */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

/* ----------------------------------
   Site Validation
---------------------------------- */
const sectionUpdateSchema = Joi.object({
  settings: Joi.object().required(),
  visible: Joi.boolean(),
});

const validateSectionUpdate = (req, res, next) => {
  const { error } = sectionUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validateLogin,
  validateSectionUpdate,
};

const { throwError } = require("./errHandler");

const validateDto = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) throwError(402, error.details[0].message, res);
  next();
};
module.exports = validateDto;

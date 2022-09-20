const Joi = require("joi");

module.exports = function (schema) {
  return function (req, res, next) {
    const { error } = schema.validate(req.body);
    if (!error) {
      next();
    } else {
      const message = error.details[0].message;
      res.status(422).send({ message });
    }
  };
};

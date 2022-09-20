const Joi = require("joi");

module.exports = function (schema) {
  return function (req, res, next) {
    const { error } = schema.validate(req.body);
    // console.log(`${JSON.stringify(validated)}`);
    if (!error) {
      next();
    } else {
      // res.send({ ok: "ok from joi" });
      console.log("--------------------------");
      console.log(error);
      console.log("There is an error?");
      const message = error.details[0].message;
      if (error.isJoi) res.status(422).send({ message });
    }
  };
};

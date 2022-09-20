const Joi = require("joi");

const reservationPOST = Joi.object({
  firstName: Joi.string().min(2).max(40).required(),
  lastName: Joi.string().min(2).max(40).required(),
  guestNumber: Joi.number().integer().min(1).max(3).required(),
  email: Joi.string().email().required(),
  checkIn: Joi.date().required(),
  checkOut: Joi.date().greater(Joi.ref("checkIn")).required(),
}).assert(
  Joi.expression("{ (number(.checkOut) - number(.checkIn)) <= (3 * day) }"),
  true,
  "checkIn and checkOut range must be at most 3 days"
);

const data = {
  firstName: "Xavier",
  lastName: "Remacle",
  guestNumber: 5,
  email: "test@test.com",
  checkIn: "11-30-2020",
  checkOut: "12-30-2020",
};

// const result = reservationPOST.validate(data);

// console.log(result);

module.exports = {
  reservationPOST,
};

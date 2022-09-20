const express = require("express");
const router = new express.Router();
const { reservationPOST } = require("../joi/reservationSchema");
const validate = require("../middleware/validate");

let reservations = {};
let bookings = {};

function getDayOfYear(date) {
  return Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );
}

function createCalendarYear(year) {
  console.log(`Creating calendar year for ${year}`);

  let yearCalendar = {};
  for (let i = 1; i <= 366; i++) {
    yearCalendar[i] = { booked: false, bookingId: undefined };
  }
  reservations[year] = yearCalendar;
}

function createReservation(userDetails, bookingId) {
  console.log("Creating Reservation");
  const dayOfYearCheckIn = getDayOfYear(userDetails.checkIn);
  const dayOfYearCheckOut = getDayOfYear(userDetails.checkOut);
  const yearWrapIndicator = dayOfYearCheckIn > dayOfYearCheckOut;
  const checkInYear = userDetails.checkIn.getFullYear();

  for (
    let i = dayOfYearCheckIn;
    i <= (yearWrapIndicator ? 366 : dayOfYearCheckOut);
    i++
  ) {
    console.log(`i: ${i}`);

    console.log(
      `Statement: ${i <= (yearWrapIndicator ? 366 : dayOfYearCheckOut)}`
    );

    reservations[checkInYear][i].booked = true;
    reservations[checkInYear][i].bookingId = bookingId;
  }

  if (yearWrapIndicator) {
    const checkOutYear = userDetails.checkOut.getFullYear();
    for (let i = 1; i <= dayOfYearCheckOut; i++) {
      console.log(
        `Statement: ${i <= (yearWrapIndicator ? 366 : dayOfYearCheckOut)}`
      );

      reservations[checkOutYear][i].booked = true;
      reservations[checkOutYear][i].bookingId = bookingId;
    }
  }

  bookings[bookingId] = {
    checkIn: userDetails.checkIn,
    checkOut: userDetails.checkOut,
  };

  console.log(`bookings: ${JSON.stringify(bookings)}`);

  return true;
}

function checkAvailability(checkIn, checkOut) {
  console.log("Checking Availability");
  const checkInYear = checkIn.getFullYear();
  const checkOutYear = checkOut.getFullYear();

  console.log(`checkInYear: ${checkInYear}`);
  console.log(`year exists?: ${reservations?.[checkInYear]}`);

  if (!reservations?.[checkInYear]) {
    createCalendarYear(checkInYear);
  }

  if (!reservations?.[checkOutYear]) {
    createCalendarYear(checkOutYear);
  }

  const dayOfYearCheckIn = getDayOfYear(checkIn);
  const dayOfYearCheckOut = getDayOfYear(checkOut);
  console.log(`inDate: ${checkIn}\noutDate: ${checkOut}`);
  console.log(`in: ${dayOfYearCheckIn}\nout: ${dayOfYearCheckOut}`);

  const yearWrapIndicator = checkInYear != checkOutYear;
  console.log(`Year wrapped: ${yearWrapIndicator}`);

  for (
    let i = dayOfYearCheckIn;
    i <= (yearWrapIndicator ? 366 : dayOfYearCheckOut);
    i++
  ) {
    console.log(`Booked?: ${reservations[checkInYear][i].booked}`);

    if (reservations[checkInYear][i].booked) {
      console.log("\t day is booked exiting...");
      return false;
    }
  }

  if (yearWrapIndicator) {
    for (let i = 0; i++; i <= dayOfYearCheckOut) {
      if (reservations[dayOfYearCheckOut][i].booked) {
        console.log("\t day is booked exiting...");
        return false;
      }
    }
  }

  return true;
}

//Create new reservation
router.post(
  "/api/v1/reservation",
  validate(reservationPOST),
  async (req, res) => {
    console.log(
      `Checking Reservation obj: ${JSON.stringify(reservations?.[2020]?.[366])}`
    );

    const userDetails = { ...req.body };
    const checkIn = new Date(userDetails.checkIn);
    const checkOut = new Date(userDetails.checkOut);
    userDetails.checkIn = checkIn;
    userDetails.checkOut = checkOut;

    const availabilityResult = checkAvailability(checkIn, checkOut);
    const now = Date.now();

    if (availabilityResult) {
      const bookingId = `${userDetails.email.split("@")[0]}_${now}`;
      const createReservationResult = createReservation(userDetails, bookingId);
      if (createReservationResult) {
        res.status(200).send({
          status: "ok",
          bookingId,
          delete: `/api/v1/reservation/${bookingId}`,
          get: `/api/v1/reservation/${bookingId}`,
        });
      }
    } else {
      res.status(400).send({ result: "Dates not available" });
    }
  }
);

//GET reservation
router.get("/api/v1/reservation/:bookingId", async (req, res) => {
  const dates = Object.keys(reservations);
  res.status(200).send({ dates });
});

module.exports = router;
// req.params.id;

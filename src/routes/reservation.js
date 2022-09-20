const express = require("express");
const router = new express.Router();
const { reservationPOST, reservationGET } = require("../joi/reservationSchema");
const validate = require("../middleware/validate");

let reservations = {};
let bookings = {};

function getDayOfYear(date) {
  return Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );
}

function createCalendarYear(year) {
  let yearCalendar = {};
  for (let i = 1; i <= 366; i++) {
    yearCalendar[i] = { booked: false, bookingId: undefined };
  }
  reservations[year] = yearCalendar;
}

function createReservation(userDetails, bookingId) {
  const dayOfYearCheckIn = getDayOfYear(userDetails.checkIn);
  const dayOfYearCheckOut = getDayOfYear(userDetails.checkOut);
  const yearWrapIndicator = dayOfYearCheckIn > dayOfYearCheckOut;
  const checkInYear = userDetails.checkIn.getFullYear();

  for (
    let i = dayOfYearCheckIn;
    i <= (yearWrapIndicator ? 366 : dayOfYearCheckOut);
    i++
  ) {
    reservations[checkInYear][i].booked = true;
    reservations[checkInYear][i].bookingId = bookingId;
  }

  if (yearWrapIndicator) {
    const checkOutYear = userDetails.checkOut.getFullYear();
    for (let i = 1; i <= dayOfYearCheckOut; i++) {
      reservations[checkOutYear][i].booked = true;
      reservations[checkOutYear][i].bookingId = bookingId;
    }
  }

  bookings[bookingId] = {
    checkIn: userDetails.checkIn,
    checkOut: userDetails.checkOut,
  };

  return true;
}

function checkAvailability(checkIn, checkOut) {
  const checkInYear = checkIn.getFullYear();
  const checkOutYear = checkOut.getFullYear();

  if (!reservations?.[checkInYear]) {
    createCalendarYear(checkInYear);
  }

  if (!reservations?.[checkOutYear]) {
    createCalendarYear(checkOutYear);
  }

  const dayOfYearCheckIn = getDayOfYear(checkIn);
  const dayOfYearCheckOut = getDayOfYear(checkOut);

  const yearWrapIndicator = checkInYear != checkOutYear;

  for (
    let i = dayOfYearCheckIn;
    i <= (yearWrapIndicator ? 366 : dayOfYearCheckOut);
    i++
  ) {
    if (reservations[checkInYear][i].booked) {
      return false;
    }
  }

  if (yearWrapIndicator) {
    for (let i = 0; i++; i <= dayOfYearCheckOut) {
      if (reservations[dayOfYearCheckOut][i].booked) {
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
        res.status(201).send({
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

router.get("/api/v1/reservation/all", async (req, res) => {
  res.status(200).send(JSON.stringify(bookings));
});

//GET reservation
router.get("/api/v1/reservation/:bookingId", async (req, res) => {
  const bookingId = req.params.bookingId;
  const getBookingResult = bookings?.[bookingId];
  if (getBookingResult) {
    res.status(200).send({ getBookingResult });
  } else {
    res.status(404).send();
  }
});

module.exports = router;
// re

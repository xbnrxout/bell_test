const express = require("express");
const router = new express.Router();
const { reservationPOST, reservationGET } = require("../joi/reservationSchema");
const validate = require("../middleware/validate");

let reservations = {};
let bookings = {};

function setReservation(booked, bookingId, year, dayStart, dayEnd) {
  for (let i = dayStart; i <= dayEnd; i++) {
    reservations[year][i] = { booked, bookingId };
  }
  return true;
}

function deleteBookingWithId(bookingId) {
  const getBookingResult = getBookingWithId(bookingId);

  /* istanbul ignore next */
  if (!getBookingResult) {
    throw new Error("Failed to get booking");
  }

  delete bookings[bookingId];
}

function resetReservation(year, startDay, endDay) {
  try {
    const resetReservationResult = setReservation(
      false,
      undefined,
      year,
      startDay,
      endDay
    );
    /* istanbul ignore next */
    if (!resetReservationResult) {
      throw new Error("Failed to reset reservation");
    }
    return true;
  } catch (err) {
    /* istanbul ignore next */
    throw err;
  }
}

function deleteReservationWithId(bookingId) {
  try {
    const getBookingResult = getBookingWithId(bookingId);
    if (!getBookingResult) {
      return getBookingResult;
    }

    const checkInDate = new Date(getBookingResult.checkIn);
    const checkOutDate = new Date(getBookingResult.checkOut);
    const checkInYear = checkInDate.getFullYear();
    const checkOutYear = checkOutDate.getFullYear();

    const yearWrapIndicator = checkInYear != checkOutYear;
    const checkInDay = getDayOfYear(checkInDate);
    const checkOutDay = getDayOfYear(checkOutDate);
    const end = yearWrapIndicator ? 366 : checkOutDay;
    const resetReservationResult = resetReservation(
      checkInYear,
      checkInDay,
      end
    );
    if (!resetReservationResult) {
      /* istanbul ignore next */
      throw new Error("Failed to delete reservation");
    }
    if (yearWrapIndicator) {
      const resetReservationResult2 = resetReservation(
        checkOutYear,
        1,
        checkOutDay
      );
      /* istanbul ignore next */
      if (!resetReservationResult2) {
        throw new Error("Failed to delete reservation");
      }
    }
    return true;
  } catch (err) {
    /* istanbul ignore next */
    throw err;
  }
}

function getBookingWithId(bookingId) {
  const booking = bookings?.[bookingId];
  if (!booking) {
    return false;
  }
  return booking;
}

function getDayOfYear(date) {
  return Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );
}

function createCalendarYear(year) {
  try {
    let yearBuilder = {};
    for (let i = 1; i <= 366; i++) {
      yearBuilder[i] = { booked: false, bookingId: undefined };
    }
    reservations[year] = yearBuilder;
  } catch (err) {
    /* istanbul ignore next */
    throw err;
  }
}

function createReservation(userDetails, bookingId) {
  try {
    const dayOfYearCheckIn = getDayOfYear(userDetails.checkIn);
    const dayOfYearCheckOut = getDayOfYear(userDetails.checkOut);
    const yearWrapIndicator = dayOfYearCheckIn > dayOfYearCheckOut;
    const checkInYear = userDetails.checkIn.getFullYear();

    setReservation(
      true,
      bookingId,
      checkInYear,
      dayOfYearCheckIn,
      yearWrapIndicator ? 366 : dayOfYearCheckOut
    );

    if (yearWrapIndicator) {
      const checkOutYear = userDetails.checkOut.getFullYear();
      setReservation(true, bookingId, checkOutYear, 1, dayOfYearCheckOut);
    }

    bookings[bookingId] = {
      checkIn: userDetails.checkIn,
      checkOut: userDetails.checkOut,
    };
    return true;
  } catch (err) {
    /* istanbul ignore next */
    return false;
  }
}

function checkAvailability(checkIn, checkOut) {
  try {
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
  } catch (err) {
    /* istanbul ignore next */
    throw err;
  }
}

//Create new reservation
router.post(
  "/api/v1/reservation",
  validate(reservationPOST),
  async (req, res) => {
    try {
      const userDetails = { ...req.body };
      const checkIn = new Date(userDetails.checkIn);
      const checkOut = new Date(userDetails.checkOut);
      userDetails.checkIn = checkIn;
      userDetails.checkOut = checkOut;

      const availabilityResult = checkAvailability(checkIn, checkOut);

      if (availabilityResult) {
        const now = Date.now();
        const bookingId = `${userDetails.email.split("@")[0]}_${now}`;
        const createReservationResult = createReservation(
          userDetails,
          bookingId
        );
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
    } catch (err) {
      /* istanbul ignore next */
      res.status(502).send(err.message);
    }
  }
);

router.get("/api/v1/reservation/all", async (req, res) => {
  try {
    res.status(200).send(JSON.stringify(reservations));
  } catch (err) {
    /* istanbul ignore next */
    res.status(502).send(err);
  }
});

router.get("/api/v1/reservation/booking/all", async (req, res) => {
  try {
    res.status(200).send(JSON.stringify(bookings));
  } catch (err) {
    /* istanbul ignore next */
    res.status(502).send(err);
  }
});

//GET reservation
router.get("/api/v1/reservation/:bookingId", async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const getBookingResult = getBookingWithId(bookingId);
    if (getBookingResult) {
      res.status(200).send({ getBookingResult });
    } else {
      res.status(404).send();
    }
  } catch (err) {
    /* istanbul ignore next */
    res.status(502).send(err.message);
  }
});

router.delete("/api/v1/reservation/:bookingId", async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const getBookingResult = getBookingWithId(bookingId);
    if (getBookingResult) {
      const deleteReservationResults = deleteReservationWithId(bookingId);
      if (!deleteReservationResults) {
        throw new Error("Failed to deleted reservation");
      }
      const deleteBookingResults = deleteBookingWithId(bookingId);
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } catch (err) {
    /* istanbul ignore next */
    res.status(502).send(err.message);
  }
});

module.exports = router;

const request = require("supertest");
const app = require("../src/app");

let validBookingId;

test("Should create reservation for user", async () => {
  const response = await request(app)
    .post("/api/v1/reservation")
    .send({
      firstName: "Xavier",
      lastName: "Remacle",
      guestNumber: 2,
      email: "test@test.com",
      checkIn: "12-31-2020",
      checkOut: "01-01-2021",
    })
    .expect(201);

  validBookingId = response.body.bookingId;
  console.log(response.body);
});

test("Should fail create reservation for user schema validation", async () => {
  const response = await request(app)
    .post("/api/v1/reservation")
    .send({
      firstName: "Xavier",
      lastName: "Remacle",
      guestNumber: 2,
      email: "test@test.com",
      checkIn: "12-31-2020",
    })
    .expect(422);
});

test("Should fail create reservation for user as reservation already exists", async () => {
  const response = await request(app)
    .post("/api/v1/reservation")
    .send({
      firstName: "Xavier",
      lastName: "Remacle",
      guestNumber: 2,
      email: "test@test.com",
      checkIn: "12-31-2020",
      checkOut: "01-01-2021",
    })
    .expect(400);
});

test("Should fail create reservation for user as reservation is over 3 days", async () => {
  const response = await request(app)
    .post("/api/v1/reservation")
    .send({
      firstName: "Xavier",
      lastName: "Remacle",
      guestNumber: 2,
      email: "test@test.com",
      checkIn: "12-25-2021",
      checkOut: "01-01-2022",
    })
    .expect(422);
});

test("Should fail create reservation for user as reservation have more that 3 people ", async () => {
  const response = await request(app)
    .post("/api/v1/reservation")
    .send({
      firstName: "Xavier",
      lastName: "Remacle",
      guestNumber: 4,
      email: "test@test.com",
      checkIn: "12-31-2021",
      checkOut: "01-01-2022",
    })
    .expect(422);
});

test("Should get all reservations", async () => {
  console.log("valid booking id: ", validBookingId);

  const url = `/api/v1/reservation/all`;
  console.log(url);
  const response = await request(app).get(url).send({}).expect(200);

  console.log(response.body);
});

test("Should get reservation with bookingId", async () => {
  console.log("valid booking id: ", validBookingId);

  const url = `/api/v1/reservation/${validBookingId}`;
  console.log(url);
  const response = await request(app).get(url).send({}).expect(200);

  expect(response.body).toStrictEqual({
    getBookingResult: {
      checkIn: "2020-12-31T05:00:00.000Z",
      checkOut: "2021-01-01T05:00:00.000Z",
    },
  });
});

test("Should fail get reservation with bookingId", async () => {
  console.log("valid booking id: ", validBookingId);

  const url = `/api/v1/reservation/${validBookingId}_123123`;
  console.log(url);
  const response = await request(app).get(url).send({}).expect(404);
});

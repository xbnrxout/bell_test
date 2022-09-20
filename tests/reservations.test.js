const request = require("supertest");
const app = require("../src/app");

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

const request = require("supertest");
const app = require("../../../src/app");

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
    })
    .expect(422);

  validBookingId = response.body.bookingId;
  console.log(response.body);
});

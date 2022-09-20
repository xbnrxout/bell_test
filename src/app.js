const express = require("express");
const reservationsRoutes = require("./routes/reservation");

const app = express();

app.use(express.json());
app.use(reservationsRoutes);

module.exports = app;

const express = require("express");
const { payment, checkPayment } = require("../controllers/payment");

const route = express.Router();

route.post("/", payment);
route.post("/check", checkPayment);

module.exports = route;

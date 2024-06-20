const express = require("express");
const { payment } = require("../controllers/payment");

const route = express.Router();

route.post("/", payment);
module.exports = route;

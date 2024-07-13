const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/dbconnect");
const initRoutes = require("./router");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser"); // npm install body-parser

const app = express();
const port = process.env.PORT || 8888;
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());

initRoutes(app);
dbConnect();

app.listen(port, () => {
  console.log(`Server is running on the post ${port}`);
});

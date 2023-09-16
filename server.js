const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/dbconnect");
const initRoutes = require("./router");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const post = process.env.PORT || 8888;
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
// app.use("/", (req, res) => {
//   res.send("SERVER ONN");
// });
app.use(
  cors({
    origin: process.env.URL_CLIENT,
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);
initRoutes(app);
dbConnect();
const listener = app.listen(post, () => {
  console.log(`Server is running on the post ${listener.address().port}`);
});

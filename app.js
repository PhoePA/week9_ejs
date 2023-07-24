const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const app = express();

// to detect extension of files
app.set("view engine", "ejs");
// to set file path of the working file
app.set("views", "views");

const postRoute = require("./routes/post");
const adminRoute = require("./routes/admin");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/post", (req, res, next) => {
  console.log("I am middleware for post");
  next();
});

app.use("/admin", adminRoute);

app.use(postRoute);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {app.listen(8080);
  console.log("Connected to MongoDB Database")})
  .catch((err) => console.log(err));

// app.listen(8080);

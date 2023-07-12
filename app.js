const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

// to detect extension of files
app.set("view engine", "ejs");
// to set file path of the working file
app.set("views", "views");

const postRoute = require("./routes/post");
const adminRoute = require("./routes/admin");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log("I am parent middleware");
  next();
});

app.use("/post", (req, res, next) => {
  console.log("I am middleware for post");
  next();
});

app.use("/admin", (req, res, next) => {
  console.log("admin middleware approved");
  next();
});

app.use("/admin", adminRoute);

app.use(postRoute);

app.listen(8080);

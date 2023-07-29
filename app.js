// packages
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);

// server
const app = express();

// to detect extension of files
app.set("view engine", "ejs");
// to set file path of the working file
app.set("views", "views");

// routes
const postRoutes = require("./routes/post");
const adminRoutes = require("./routes/admin");
//cookie lesson
const authRoutes = require("./routes/auth");

// model
const User = require("./models/user");

const store = new mongoStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

//custom middlewares
// app.use("/post", (req, res, next) => {
//   console.log("I am middleware for post");
//   next();
// });

app.use("/", (req, res, next) => {
  User.findById("64bf41719de8bf3c5f01de02")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);

app.use(postRoutes);
// cookie
app.use(authRoutes);

// connect database
mongoose
  .connect(process.env.MONGODB_URL)
  .then((result) => {
    app.listen(8080);
    console.log("Connected to MongoDB Database");

    return User.findOne().then((user) => {
      if (!user) {
        User.create({
          username: "Coder",
          email: "codehub@gmail.com",
          password: "123asd",
        });
      }
      return user;
    });
  })
  .then((result) => {
    console.log(result);
  })
  .catch((err) => console.log(err));

// app.listen(8080);

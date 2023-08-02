// packages
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash")


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

const { isLogin } = require("./middleware/isLogin");

const store = new mongoStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

const csrfProtect = csrf();


//middleware
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

// token for security at form data
app.use(csrfProtect);
app.use(flash())

app.use("/", (req, res, next) => {
  // checking login? and logined userinfo
  // console.log(req.session.isLogin);
  // console.log(req.session.userInfo._id);

  if (req.session.isLogin === undefined) {
    return next();
  }

  User.findById(req.session.userInfo._id)
    .select("_id email")
    .then((user) => {
      req.user = user;
      console.log(req.user);
      next();
    })
    .catch((err) => console.log(err));
});

//to send csrf token for rendering every page
app.use((req, res, next) => {
  res.locals.isLogin = req.session.isLogin ? true : false;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", isLogin, adminRoutes);

app.use(postRoutes);
// cookie
app.use(authRoutes);

// connect database
mongoose
  .connect(process.env.MONGODB_URL)
  .then((result) => {
    app.listen(8080);
    console.log("Connected to MongoDB Database");

    // return User.findOne().then((user) => {
    //   if (!user) {
    //     User.create({
    //       username: "Coder",
    //       email: "codehub@gmail.com",
    //       password: "123asd",
    //     });
    //   }
    //   return user;
    // });
  })
  // .then((result) => {
  //   console.log(result);
  // })
  .catch((err) => console.log(err));

// app.listen(8080);

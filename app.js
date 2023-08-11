// packages
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
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

// controller
const errorController = require("./controllers/error");

const { isLogin } = require("./middleware/isLogin");

const store = new mongoStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

const csrfProtect = csrf();

// storage config
const storageConfigure = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilterConfigure = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//middleware
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads",express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: storageConfigure, fileFilter: fileFilterConfigure }).single(
    "photo"
  )
);
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
app.use(flash());

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

app.use(authRoutes);

app.all("*", errorController.get404Page);
//error middleware
app.use(errorController.get500Page);

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

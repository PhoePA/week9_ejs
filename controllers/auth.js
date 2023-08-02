const bcrypt = require("bcrypt");
const User = require("../models/user");

const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});
//render register page
exports.getRegisterPage = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/register", { title: "Register", errorMsg: message });
};

// handle register
exports.registerAccount = (req, res) => {
  const { username, email, password } = req.body;
  // console.log(username, email, password);
  User.findOne({ email })
    .then((user) => {
      if (user) {
        req.flash("error", "Email is already registered. Please use another!");
        return res.redirect("/register");
      }
      return bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          return User.create({
            username,
            email,
            password: hashedPassword,
          });
        })
        .then(() => {
          res.redirect("/login");
          transporter.sendMail(
            {
              from: process.env.SENDER_MAIL,
              to: email,
              subject: "Registered Successfully",
              html: "<h1>Registered Successfully.</h1><p>Create an account using this email address in Blog.io.</p>",
            },
            (err) => {
              console.log(err);
            }
          );
        });
    })
    .catch((err) => console.log(err));
};

// render log in page
exports.getLoginPage = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", { title: "Login Page", errorMsg: message });
};

// handle login
exports.postLoginData = (req, res) => {
  // res.setHeader("Set-Cookie","isLogIn=true") // cookie
  const { username, email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Check your information and Try Again!");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLogin = true;
            req.session.userInfo = user;
            return req.session.save((err) => {
              res.redirect("/");
              console.log(err);
            });
          }
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));

  // req.session.isLogin = true;
  // res.redirect("/");
};

//handle logout
exports.logOut = (req, res) => {
  req.session.destroy((_) => {
    res.redirect("/");
  });
};

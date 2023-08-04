const bcrypt = require("bcrypt");
const User = require("../models/user");
const crypto = require("crypto");
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
      return bcrypt.hash(password, 10).then((hashedPassword) => {
        return User.create({
          username,
          email,
          password: hashedPassword,
        });
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

// render reset password page
exports.getResetPage = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    title: "Reset Password",
    errorMsg: message,
  });
};

//render feedback
exports.getFeedbackPage = (req, res) => {
  res.render("auth/feedback", { title: "Feedback Success!" });
};

//reset password link send
exports.resetLinkSend = (req, res) => {
  const { email } = req.body;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset-password");
    }
    const token = buffer.toString("hex");
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account match with this email.");
          return res.redirect("/reset-password");
        }
        user.resetToken = token;
        user.tokenExpireTime = Date.now() + 1800000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/feedback");
        transporter.sendMail({
          from: process.env.SENDER_MAIL,
          to: email,
          subject: "Reset Password",
          html: `<h4>Dear User</h4><p>If you requested to reset your password.</p><p>This is the reset password link.</p><a href="http://localhost:8080/reset-password/${token}" target="_blank">Click me to change password!</a>`,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPasswordPage = (req, res) => {
  const { token } = req.params;
  User.findOne({ resetToken: token, tokenExpireTime: { $gt: Date.now() } })
    .then((user) => {
      console.log(user);
      if (user) {
        let message = req.flash("error");
        if (message.length > 0) {
          message = message[0];
        } else {
          message = null;
        }
        res.render("auth/new-password", {
          title: "Change Password",
          errorMsg: message,
          resetToken: token,
          user_id: user._id,
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((err) => console.log(err));
};

exports.changeNewPassword = (req, res) => {
  const { password, confirm_password, user_id, resetToken } = req.body;
  let resetUser;
  User.findOne({
    resetToken,
    tokenExpireTime: { $gt: Date.now() },
    _id: user_id,
  })
    .then((user) => {
      if (password === confirm_password) {
        resetUser = user;
        return bcrypt.hash(password, 10);
      }
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.tokenExpireTime = undefined;
      return resetUser.save();
    })
    .then((_) => res.redirect("/login"))
    .catch((err) => console.log(err));
};

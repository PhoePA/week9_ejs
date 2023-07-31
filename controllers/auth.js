const bcrypt = require("bcrypt");
const User = require("../models/user");

//render register page
exports.getRegisterPage = (req, res) => {
  res.render("auth/register", { title: "Register" });
};

// handle register
exports.registerAccount = (req, res) => {
  const { username, email, password } = req.body;
  // console.log(username, email, password);
  User.findOne({ email })
    .then((user) => {
      if (user) {
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
        });
    })
    .catch((err) => console.log(err));
};

// render log in page
exports.getLoginPage = (req, res) => {
  res.render("auth/login", { title: "Login Page" });
};

// handle login
exports.postLoginData = (req, res) => {
  // res.setHeader("Set-Cookie","isLogIn=true") // cookie
  const { username, email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
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

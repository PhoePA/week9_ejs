const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../models/user");

const authController = require("../controllers/auth");

// render register page route
router.get("/register", authController.getRegisterPage);

//handle register
router.post(
  "/register",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid address!")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject(
            "Email has already taken. Please choose another one!"
          );
        }
      });
    }),
  body("password")
    .isLength({ min: 4 })
    .trim()
    .withMessage("Password must have at least 4 characters!"),
  authController.registerAccount
);

// render login page
router.get("/login", authController.getLoginPage);

// handle login page
router.post(
  "/login",
  body("email").isEmail().withMessage("Please enter a valid address!"),
  body("password")
    .isLength({ min: 4 })
    .trim()
    .withMessage("Password is not the same"),
  authController.postLoginData
);

// handle logout
router.post("/logout", authController.logOut);

// render reset password page
router.get("/reset-password", authController.getResetPage);

// render feedback page
router.get("/feedback", authController.getFeedbackPage);

// send reset email
router.post("/reset", authController.resetLinkSend);

// render new password
router.get("/reset-password/:token", authController.getNewPasswordPage);

// handle new password
router.post(
  "/change-new-password",
  body("password")
    .isLength({ min: 4 })
    .trim()
    .withMessage("Password must have at least 4 characters!"),
  body("confirm_password")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password must be matched!");
      }
      return true;
    }),
  authController.changeNewPassword
);

module.exports = router;

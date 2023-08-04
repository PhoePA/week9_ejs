const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");

// render register page route
router.get("/register", authController.getRegisterPage);

//handle register
router.post("/register", authController.registerAccount);

// render login page
router.get("/login", authController.getLoginPage);

// handle login page
router.post("/login", authController.postLoginData);

// handle logout page
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
router.post("/change-new-password", authController.changeNewPassword);

module.exports = router;

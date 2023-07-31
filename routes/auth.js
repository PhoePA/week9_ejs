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

module.exports = router;

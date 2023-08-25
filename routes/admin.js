const express = require("express");
const { log } = require("console");

const router = express.Router();

const postController = require("../controllers/post");
const userController = require("../controllers/user");

const { body } = require("express-validator");

const {isPremium} = require("../middleware/is-premium")

// admin/create-post
router.get("/create-post", postController.renderCreatePage);

router.post(
  "/",
  [
    body("title")
      .isLength({ min: 10 })
      .withMessage("Title must have 10 letters."),
    // .trim(),
    // body("photo").isURL().withMessage("Image must be a valid Url."),
    // body("photo").isMimeType("image"),
    body("description")
      .isLength({ min: 30 })
      .withMessage("Description must have at least 30 characters."),
  ],
  postController.createPost
);

// admin/
router.get("/edit/:postId", postController.getEditPost);

router.post(
  "/edit-post",
  [
    body("title")
      .isLength({ min: 10 })
      .withMessage("Title must have 10 letters.")
      .trim(),
    // body("photo").isURL().withMessage("Image must be a valid Url."), // insert photo link validation
    body("description")
      .isLength({ min: 30 })
      .withMessage("Description must have at least 30 characters."),
  ],
  postController.updatePost
);

router.post("/delete/:postId", postController.deletePost);

// get profile
router.get("/profile", userController.getProfile);

router.get("/premium", userController.renderPremiumPage);

router.get("/subscription-success", userController.getSubscriptionSuccessPage);

router.get("/subscription-cancel", userController.renderPremiumPage);

router.get("/premium-details", userController.getPremiumDetails);

router.get("/profile-image", isPremium, userController.getProfileUploadPage);

router.post("/set-profile", isPremium, userController.setProfileImage);

module.exports = router;

const express = require("express");
const path = require("path");

const router = express.Router();
const { posts } = require("./admin");

const postController = require("../controllers/post");
const userController = require("../controllers/user");

router.get("/", postController.renderHomePage);

// router.get("/post", (req, res) => {
//   res.sendFile(path.join(__dirname, "..", "views", "postPage.html"));
// });
router.get("/post/:postId", postController.getPost);

router.get("/save/:id", postController.savePostPDF);

router.get("/profile/:id", userController.getPublicProfile);

module.exports = router;

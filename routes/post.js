const express = require("express");
const path = require("path");

const router = express.Router();

const postController = require("../controllers/posts");

router.get("/", postController.getPosts);

// router.get("/post", (req, res) => {
//   res.sendFile(path.join(__dirname, "..", "views", "postPage.html"));
// });
router.get("/post/:postId", postController.getPost);

module.exports = router;

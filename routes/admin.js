const { log } = require("console");
const express = require("express");

const router = express.Router();

const postController = require("../controllers/post");

router.get("/create-post", postController.renderCreatePage);

router.post("/", postController.createPost);

// admin/
router.get("/edit/:postId", postController.getEditPost);

router.post("/edit-post", postController.updatePost);

router.post("/delete/:postId", postController.deletePost);

module.exports = router;

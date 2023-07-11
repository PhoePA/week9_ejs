const express = require("express");
const path = require("path");

const router = express.Router();
const { posts } = require("./admin");

router.get("/", (req, res) => {
  console.log(posts);
  // res.sendFile(path.join(__dirname, "..", "views", "homePage.html"));
  res.render("home", {
    title: "Home Page",
    postsArray: posts,
  });
});

router.get("/post", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "postPage.html"));
});

module.exports = router;

const { log } = require("console");
const express = require("express");
const path = require("path");
const router = express.Router();

const posts = [];

router.get("/create-post", (req, res) => {
  // res.sendFile(path.join(__dirname, "..", "views", "addPost.html"));
  res.render("addPost", { title: "Post Page" });
});

router.post("/", (req, res) => {
  const { title, description } = req.body;
  console.log(`Title value is ${title} and Description is ${description}.`);
  posts.push({
    title,
    description,
  });
  console.log(posts);
  res.redirect("/");
});

module.exports = { adminRoute: router, posts };

const Post = require("../models/post");

const posts = [];

exports.createPost = (req, res) => {
  const { title, description, photo } = req.body;
  // console.log(` Title value is ${title} and Description is ${description}.`);
  // posts.push({
  //   id: Math.random(),
  //   title,
  //   description,
  //   photo,
  // });
  // console.log(posts);
  // res.redirect("/");

  const post = new Post(title, description, photo);

  post
    .create()
    .then((result) => {
      console.log(result);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.renderCreatePage = (req, res) => {
  // res.sendFile(path.join(__dirname, "..", "views", "addPost.html"));
  res.render("addPost", { title: "Post Page" });
};

exports.renderHomePage = (req, res) => {
  // console.log(posts);
  // res.sendFile(path.join(__dirname, "..", "views", "homePage.html"));

  Post.getPosts()
    .then((posts) => {
      res.render("home", {
        title: "Home Page",
        postsArray: posts,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getPost = (req, res) => {
  const postId = req.params.postId;
  Post.getPost(postId)
    .then((post) => {
      res.render("details", { title: post.title, post });
    })
    .catch((err) => {
      console.log(err);
    });

  // const post = posts.find((post) => post.id === postID);
  // console.log(post);
};

exports.getEditPost = (req, res) => {
  const postId = req.params.postId;
  Post.getPost(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/");
      }
      res.render("editPost", { title: post.title, post });
    })
    .catch((err) => console.log(err));
};

exports.updatePost = (req, res) => {
  const { postId, title, description, photo } = req.body;
  const post = new Post(title, description, photo, postId);

  post
    .create()
    .then((result) => {
      console.log("Post updated");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.deletePost = (req, res) => {
  const { postId } = req.params;
  Post.deletePostById(postId)
    .then(() => {
      console.log("Post deleted Successfully!");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

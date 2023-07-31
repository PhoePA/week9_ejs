const Post = require("../models/post");

// const posts = [];

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

  //using mongoDB pure package
  // const post = new Post(title, description, photo);

  // post
  //   .create()
  //   .then((result) => {
  //     console.log(result);
  //     res.redirect("/");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  //create data using mongoose
  Post.create({ title, description, imgUrl: photo, userId: req.user })
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

  //cookie
  // const cookie = req.get("Cookie").split("=")[1].trim()==="true";
  // console.log(cookie);

  // Post.getPosts() // read data from pure  mongodb
  Post.find()
    .select("title")
    .populate("userId", "username")
    .sort({ title: -1 }) // read data from mongosedb and sort A-Z
    .then((posts) => {
      // console.log(posts);
      res.render("home", {
        title: "Home Page",
        postsArray: posts, isLogin: req.session.isLogin ? true : false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getPost = (req, res) => {
  const postId = req.params.postId;
  // Post.getPost(postId) // get data from pure mongodb
  Post.findById(postId) // find data from mongoosedb
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
  Post.findById(postId)
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

  Post.findById(postId)
    .then((post) => {
      post.title = title;
      post.description = description;
      post.imgUrl = photo;
      return post.save();
    })
    .then((result) => {
      console.log("Post updated");
      res.redirect("/");
    })
    .catch((err) => console.log(err));

  // const post = new Post(title, description, photo, postId);

  // post
  //   .create()
  //   .then((result) => {
  //     console.log("Post updated");
  //     res.redirect("/");
  //   })
  //   .catch((err) => console.log(err));
};

exports.deletePost = (req, res) => {
  const { postId } = req.params;
  Post.findByIdAndRemove(postId)
    .then(() => {
      console.log("Post deleted Successfully!");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

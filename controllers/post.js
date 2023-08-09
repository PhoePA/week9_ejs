const Post = require("../models/post");
const { validationResult } = require("express-validator");
const formatISO9075 = require("date-fns/formatISO9075");

// const posts = [];

exports.createPost = (req, res, next) => {
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

  // validation with express-validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("addPost", {
      title: "Create Post Page",
      errorMsg: errors.array()[0].msg,
      oldFormData: { title, photo, description },
    });
  }

  //create data using mongoose
  Post.create({ title, description, imgUrl: photo, userId: req.user })
    .then((result) => {
      console.log(result);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something Went Wrong When Creating Post!");
      return next(error);
    });
};

exports.renderCreatePage = (req, res, next) => {
  // res.sendFile(path.join(__dirname, "..", "views", "addPost.html"));
  res.render("addPost", {
    title: "Create Post Page",
    errorMsg: "",
    oldFormData: { title: "", photo: "", description: "" },
  });
};

exports.renderHomePage = (req, res, next) => {
  // console.log(posts);
  // res.sendFile(path.join(__dirname, "..", "views", "homePage.html"));

  //cookie
  // const cookie = req.get("Cookie").split("=")[1].trim()==="true";
  // console.log(cookie);

  // console.log(req.session.userInfo);

  // Post.getPosts() // read data from pure  mongodb
  Post.find()
    .select("title imgUrl description")
    .populate("userId", "email")
    .sort({ title: -1 }) // read data from mongosedb and sort A-Z
    .then((posts) => {
      // console.log(posts);
      res.render("home", {
        title: "Home Page",
        postsArray: posts,
        currentUserEmail: req.session.userInfo
          ? req.session.userInfo.email
          : "",
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(
        "Cannot Find Post. Please Go Back Previous Page!"
      );
      return next(error);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  // Post.getPost(postId) // get data from pure mongodb
  Post.findById(postId)
    .populate("userId", "email") // find data from mongoosedb
    .then((post) => {
      // console.log(post);
      res.render("details", {
        title: post.title,
        post,
        date: post.createdAt
          ? formatISO9075(post.createdAt, { representation: "date" })
          : "",
        currentLoginUserId: req.session.userInfo
          ? req.session.userInfo._id
          : "",
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Post not Found with this ID!");
      return next(error);
    });

  // const post = posts.find((post) => post.id === postID);
  // console.log(post);
};

exports.getEditPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/");
      }
      res.render("editPost", {
        postId: undefined,
        title: post.title,
        post,
        errorMsg: "",
        oldFormData: {
          title: undefined,
          photo: undefined,
          description: undefined,
        },
        isValidationFail: false,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(
        "Something Went Wrong When You Editing This Post. Please Try Again!"
      );
      return next(error);
    });
};

exports.updatePost = (req, res, next) => {
  const { postId, title, description, photo } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("editPost", {
      postId,
      title,
      errorMsg: errors.array()[0].msg,
      oldFormData: { title, photo, description },
      isValidationFail: true,
    });
  }
  Post.findById(postId)
    .then((post) => {
      if (post.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      post.title = title;
      post.description = description;
      post.imgUrl = photo;
      return post.save().then((result) => {
        console.log("Post updated");
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(
        "Something Went Wrong When You Updating This Post. Please Try Again!!"
      );
      return next(error);
    });

  // const post = new Post(title, description, photo, postId);

  // post
  //   .create()
  //   .then((result) => {
  //     console.log("Post updated");
  //     res.redirect("/");
  //   })
  //   .catch((err) => console.log(err));
};

exports.deletePost = (req, res, next) => {
  const { postId } = req.params;
  Post.deleteOne({ _id: postId, userId: req.user._id })
    .then(() => {
      console.log("Post deleted Successfully!");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

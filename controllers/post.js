const Post = require("../models/post");
const { validationResult } = require("express-validator");
const formatISO9075 = require("date-fns/formatISO9075");
const pdf = require("pdf-creator-node");
const fs = require("fs");
const expressPath = require("path");

const fileDelete = require("../utils/fileDelete");
const { log } = require("console");

const postPerPage = 5;

exports.createPost = (req, res, next) => {
  const { title, description } = req.body;
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

  // log files
  // console.log(req.file);
  const image = req.file;
  console.log("I am image info" + image);

  // validation with express-validation
  const errors = validationResult(req);

  // mimetype for image validation
  if (image === undefined) {
    return res.status(422).render("addPost", {
      title: "Create Post Page",
      errorMsg: "Please upload valid Image format like JPG, JPEG and PNG!",
      oldFormData: { title, description },
    });
  }

  // title & description validation
  if (!errors.isEmpty()) {
    return res.status(422).render("addPost", {
      title: "Create Post Page",
      errorMsg: errors.array()[0].msg,
      oldFormData: { title, description },
    });
  }

  console.log(image.path);
  //create data using mongoose
  Post.create({ title, description, imgUrl: image.path, userId: req.user })
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
  const pageNumber = +req.query.page || 1;

  let totalPostNumber;
  // res.sendFile(path.join(__dirname, "..", "views", "homePage.html"));

  //cookie
  // const cookie = req.get("Cookie").split("=")[1].trim()==="true";
  // console.log(cookie);

  // console.log(req.session.userInfo);

  // get no of post
  Post.find()
    .countDocuments()
    .then((totalPostCount) => {
      totalPostNumber = totalPostCount;

      // total  =12
      // per page = 3
      // next page = -3  +3

      // page => 1-1 = 0
      // per page => 3 * 0 = 0

      // page => 2-1 = 1
      // per page => 3*1 =3

      // page => 3-1 = 2
      // per page => 3 * 2 = 6

      // page => 4 -1 =3
      // per page => 3*3 = 9

      // Post.getPosts() // read data from pure  mongodb
      return Post.find()
        .select("title imgUrl description")
        .populate("userId", "email")
        .skip((pageNumber - 1) * postPerPage)
        .limit(postPerPage)
        .sort({ createdAt: -1 }); // read data from mongosedb and sort
    })
    .then((posts) => {
      if (posts.length > 0) {
        return res.render("home", {
          title: "Home Page",
          postsArray: posts,
          currentUserEmail: req.session.userInfo
            ? req.session.userInfo.email
            : "",
          currentPage: pageNumber,
          nextPage: pageNumber + 1,
          previousPage: pageNumber - 1,
          hasNextPage: postPerPage * pageNumber < totalPostNumber,
          hasPreviousPage: pageNumber > 1,
        });
      } else {
        return res.status(500).render("error/500", {
          title: "Error 404 ",
          message: "No Post In this Page!",
        });
      }
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
          // photo: undefined,
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
  const { postId, title, description } = req.body;

  const image = req.file;
  const errors = validationResult(req);
  // if (image === undefined) {
  //   return res.status(422).render("editPost", {
  //     postId,
  //     title,
  //     isValidationFail: true,
  //     errorMsg: "Please upload valid Image format like JPG, JPEG and PNG!",
  //     oldFormData: { title, description },
  //   });
  // }
  if (!errors.isEmpty()) {
    return res.status(422).render("editPost", {
      postId,
      title,
      errorMsg: errors.array()[0].msg,
      oldFormData: { title, description },
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
      if (image) {
        fileDelete(post.imgUrl);
        post.imgUrl = image.path;
      }
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

  // delete photo in folder
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/");
      }
      // delete post image from local storage
      fileDelete(post.imgUrl);

      // delete post data in database
      return Post.deleteOne({ _id: postId, userId: req.user._id });
    })
    .then(() => {
      console.log("Post deleted Successfully!");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(
        "Something Went Wrong When You Updating This Post. Please Try Again!!"
      );
      return next(error);
    });
};

exports.savePostPDF = (req, res, next) => {
  const { id } = req.params;
  const templateUrl = `${expressPath.join(
    __dirname,
    "../views/template/template.html"
  )}`;
  const html = fs.readFileSync(templateUrl, "utf8");
  const options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    header: {
      height: "20mm",
      contents:
        '<h4 style="text-align: center;font-size: 2rem;">PDF Download from Blog.IO</h4>',
    },
  };

  Post.findById(id)
    .populate("userId", "email")
    .lean()
    .then((post) => {
      const date = new Date();
      const pdfSavedUrl = `${expressPath.join(
        __dirname,
        "../public/pdf",
        date.getTime() + ".pdf"
      )}`;

      const document = {
        html,
        data: {
          post,
        },
        path: pdfSavedUrl,
        type: "",
      };

      pdf
        .create(document, options)
        .then((result) => {
          console.log(result);
          res.download(pdfSavedUrl, (err) => {
            if (err) throw err;
            fileDelete(pdfSavedUrl);
          });
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(
        "Something Went Wrong When You Updating This Post. Please Try Again!!"
      );
      return next(error);
    });
};

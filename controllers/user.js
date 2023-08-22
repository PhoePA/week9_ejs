const Post = require("../models/post");

const postPerPage = 5;

exports.getProfile = (req, res, next) => {
  const pageNumber = +req.query.page || 1;

  let totalPostNumber;

  // get no of post
  Post.find({ userId: req.user._id })
    .countDocuments()
    .then((totalPostCount) => {
      totalPostNumber = totalPostCount;

      // Post.getPosts() // read data from pure  mongodb
      return Post.find({ userId: req.user._id })
        .populate("userId", "email username")
        .skip((pageNumber - 1) * postPerPage)
        .limit(postPerPage)
        .sort({ createdAt: -1 }); // read data from mongosedb and sort
    })
    .then((posts) => {
      if (posts.length > 0) {
        return res.render("user/profile", {
          title: req.session.userInfo.email,
          postsArray: posts,
          currentPage: pageNumber,
          nextPage: pageNumber + 1,
          previousPage: pageNumber - 1,
          hasNextPage: postPerPage * pageNumber < totalPostNumber,
          hasPreviousPage: pageNumber > 1,
          currentUserEmail: req.session.userInfo
            ? req.session.userInfo.email
            : "",
        });
      } else {
        return res.status(500).render("error/500", {
          title: "Error 500 ",
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

exports.getPublicProfile = (req, res, next) => {
  const { id } = req.params;
  const pageNumber = +req.query.page || 1;

  let totalPostNumber;

  // get no of post
  Post.find({ userId: id })
    .countDocuments()
    .then((totalPostCount) => {
      totalPostNumber = totalPostCount;

      // Post.getPosts() // read data from pure  mongodb
      return Post.find({ userId: id })
        .populate("userId", "email")
        .skip((pageNumber - 1) * postPerPage)
        .limit(postPerPage)
        .sort({ createdAt: -1 }); // read data from mongosedb and sort
    })
    .then((posts) => {
      if (posts.length > 0) {
        return res.render("user/public-profile", {
          title: posts[0].userId.email,
          postsArray: posts,
          currentPage: pageNumber,
          nextPage: pageNumber + 1,
          previousPage: pageNumber - 1,
          hasNextPage: postPerPage * pageNumber < totalPostNumber,
          hasPreviousPage: pageNumber > 1,
          currentUserEmail: posts[0].userId.email,
        });
      } else {
        return res.status(500).render("error/500", {
          title: "Error 500 ",
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

exports.renderPremiumPage = (req, res) => {
  res.render("user/premium", { title: "premium" });
};
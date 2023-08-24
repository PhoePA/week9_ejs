const Post = require("../models/post");
const stripe = require("stripe")(
  "sk_test_51NhpGSClSmTc4DNoWaqHvooFdLTAmglFht7zXXxUtTApOvvdsAF3mULg5BWFXcmwwaclSw0nQ6Rd8OpDkBBH5HIA00PJs2xcaw"
);
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
        .populate("userId", "email username isPremium")
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
        .populate("userId", "email isPremium username")
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

exports.renderPremiumPage = (req, res, next) => {
  stripe.checkout.sessions
    .create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1Ni6vzClSmTc4DNoBPTlLpjx",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.protocol}://${req.get(
        "host"
      )}/admin/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get(
        "host"
      )}/admin/subscription-cancel`,
    })
    .then((stripe_session) => {
      res.render("user/premium", {
        title: "Buy Premium",
        session_id: stripe_session.id,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something Went Wrong!");
      return next(error);
    });
};

exports.getSubscriptionSuccessPage = (req, res, next) => {
  const session_id = req.query.session_id;

  if (!session_id) {
    return res.redirect("/admin/profile");
  }

  User.findById(req.user._id)
    .then((user) => {
      user.isPremium = true;
      user.payment_session_key = session_id;
      return user.save();
    })
    .then((_) => {
      res.render("user/subscription-success", {
        title: "Subscription Success!",
        subscription_id: session_id,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something Went Wrong!");
      return next(error);
    });
};

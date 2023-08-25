const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
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
        .populate("userId", "email username isPremium profile_imgUrl")
        .skip((pageNumber - 1) * postPerPage)
        .limit(postPerPage)
        .sort({ createdAt: -1 }); // read data from mongosedb and sort
    })
    .then((posts) => {
      if (!posts.length > 0 && pageNumber > 1) {
        return res.status(500).render("error/500", {
          title: "Error 500 ",
          message: "No Post In this Page!",
        });
      } else {
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
        .populate("userId", "email isPremium username profile_imgUrl")
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

  if (!session_id || !session_id.includes("cs_test_")) {
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
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something Went Wrong!");
      return next(error);
    });
};

exports.getPremiumDetails = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      return stripe.checkout.sessions.retrieve(user.payment_session_key);
    })
    .then((stripe_session) => {
      res.render("user/premium-details", {
        title: "Status",
        customer_id: stripe_session.customer,
        country: stripe_session.customer_details.address.country,
        postal_code: stripe_session.customer_details.address.postal_code,
        email: stripe_session.customer_details.email,
        name: stripe_session.customer_details.name,
        invoice_id: stripe_session.invoice,
        status: stripe_session.payment_status,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something Went Wrong!");
      return next(error);
    });
};

exports.getProfileUploadPage = (req, res) => {
  res.render("user/profile-upload", { title: "Profile Image", errorMsg: "" });
};

exports.setProfileImage = (req, res) => {
  const photo = req.file;

  const errors = validationResult(req);

  // mimetype for image validation
  if (photo === undefined) {
    return res.status(422).render("user/profile-upload", {
      title: "Profile Image",
      errorMsg: "Please upload valid Image format like JPG, JPEG and PNG!",
    });
  }

  // title & description validation
  if (!errors.isEmpty()) {
    return res.status(422).render("user/profile-upload", {
      title: "Profile Image",
      errorMsg: errors.array()[0].msg,
    });
  }

  User.findById(req.user._id)
    .then((user) => {
      user.profile_imgUrl = photo.path;
      return user.save();
    })
    .then((_) => {
      res.redirect("/admin/profile");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something Went Wrong!");
      return next(error);
    });
};

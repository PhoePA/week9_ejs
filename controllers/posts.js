// const posts = [];

const Post = require("../models/post");

exports.createPost = (req, res) => {
  const { title, description, photo } = req.body;
  // console.log(` Title value is ${title} and Description is ${description}.`);

  // inserting data into custom array
  // posts.push({
  //   id: Math.random(),
  //   title,
  //   description,
  //   photo,
  // });

  // inserting data from database
  // const post = new Post(title, description, photo);
  // post
  //   .setPost()
  //   .then(() => {
  //     res.redirect("/");
  //   })
  //   .catch((err) => console.log(err));

  // create data into database with sequelize
  req.user.createPost({
    title,
    description,
    imgUrl: photo,
  })
    .then((result) => {
      console.log(result);
      console.log("new Post created");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.renderCreatePage = (req, res) => {
  // res.sendFile(path.join(__dirname, "..", "views", "addPost.html"));
  res.render("addPost", { title: "Post Page" });
};

exports.getPosts = (req, res) => {
  // get data from Sequelize database
  Post.findAll({
    order: [[`createdAt`, `DESC`]],
  })
    .then((posts) => {
      res.render("home", {
        title: "Home Page",
        postsArr: posts,
      });
    })
    .catch((err) => console.log(err));
  // console.log(posts);
  // res.sendFile(path.join(__dirname, "..", "views", "homePage.html"));

  // get data from MySQL
  // Post.getAllPost()
  //   .then(([rows]) => {
  //     console.log(rows);
  //     res.render("home", {
  //       title: "Home Page",
  //       postsArr: rows,
  //     });
  //   })
  //   .catch((err) => console.log(err));
};

exports.getPost = (req, res) => {
  // const postID = Number(req.params.postId);
  const postID = req.params.postId;
  // console.log(postID);

  //get id from custom created data
  // const post = posts.find((post) => post.id === postID);
  // console.log(post);

  // get data from MySQL
  // Post.getSinglePost(postID)
  //   .then(([row]) => {
  //     console.log(row);
  //     res.render("details", { title: "Post Details Page", post: row[0] });
  //   })
  //   .catch((err) => console.log(err));

  // get data from sequelize database
  // Post.findOne({ where: { id: postID } })
  Post.findByPk(postID)
    .then((post) => {
      res.render("details", { title: "Post Details Page", post });
    })
    .catch((err) => console.log(err));
};

exports.deletePost = (req, res) => {
  const postId = req.params.postId;

  // console.log(postId);

  // first method
  Post.findByPk(postId)
    .then((post) => {
      if (!post) {
        res.redirect("/");
      }
      return post.destroy();
    })
    .then((result) => {
      console.log(result);
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.getOldPost = (req, res) => {
  const postId = req.params.postId;
  Post.findByPk(postId)
    .then((post) => {
      // console.log(post);
      res.render("editPost", { title: `${post.title}`, post });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.updatePost = (req, res) => {
  const { title, description, photo, postID } = req.body;
  // console.log(` Title value is ${title} and Description is ${description}.`);

  Post.findByPk(postID)
    .then((post) => {
      // console.log(post);
      (post.title = title),
        (post.description = description),
        (post.imgUrl = photo);
      return post.save();
    })
    .then((result) => {
      console.log(`Post id => ${postID} is updated successfully.`);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

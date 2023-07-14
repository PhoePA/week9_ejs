// const posts = [];

const Post = require("../models/posts");

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
  Post.create({
    title,
    description,
    imgUrl: photo,
  })
    .then((result) => {
      console.log(result);
      console.log("new Pos created");
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
  Post.findAll()
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

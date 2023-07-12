const posts = [];

exports.createPost = (req, res) => {
  const { title, description, photo } = req.body;
  // console.log(` Title value is ${title} and Description is ${description}.`);
  posts.push({
    id: Math.random(),
    title,
    description,
    photo,
  });
  console.log(posts);
  res.redirect("/");
};

exports.renderCreatePage = (req, res) => {
  // res.sendFile(path.join(__dirname, "..", "views", "addPost.html"));
  res.render("addPost", { title: "Post Page" });
};

exports.renderHomePage = (req, res) => {
  // console.log(posts);
  // res.sendFile(path.join(__dirname, "..", "views", "homePage.html"));
  res.render("home", {
    title: "Home Page",
    postsArray: posts,
  });
};

exports.getPost = (req, res) => {
  const postID = Number(req.params.postId);
  console.log(postID);

  const post = posts.find((post) => post.id === postID);
  console.log(post);

  res.render("details", { title: "Post Details Page", post });
};

//default modules
const express = require("express");
const path = require("path");

//3rd party package
const bodyParser = require("body-parser");

//local import
const sequelize = require("./utils/database.js");

const Post = require("./models/post");
const User = require("./models/user");

const app = express();

// to detect extension of files
app.set("view engine", "ejs");
// to set file path of the working file
app.set("views", "views");

const postRoute = require("./routes/post");
const adminRoute = require("./routes/admin");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      console.log(user);
      next();
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  console.log("I am parent middleware");
  next();
});

app.use("/post", (req, res, next) => {
  console.log("I am middleware for post");
  next();
});

app.use("/admin", (req, res, next) => {
  console.log("admin middleware approved");
  next();
});

app.use("/admin", adminRoute);

app.use(postRoute);

// association with the method one-to-one
Post.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
});

// association with the method one-to-many
User.hasMany(Post);

sequelize
  // .sync({ force: true }) to create new column byForce
  .sync()
  .then((result) => {
    return User.findByPk(1);
    // console.log(result);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "CodeHub", email: "abc@gmail.com" });
    }
    return user;
  })
  .then((user) => {
    console.log(user);
    app.listen(8080);
  })
  .catch((err) => console.log(err));

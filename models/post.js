// custom built database using mysql2
// const dbData = require("../utils/database");

// module.exports = class Post {
//   constructor(title, description, image_url) {
//     this.title = title;
//     this.description = description;
//     this.image_url = image_url;
//   }

//   setPost() {
//     return dbData.execute(
//       "INSERT INTO posts (title,description,image_url) VALUES (?,?,?)",
//       [this.title, this.description, this.image_url]
//     );
//   }
//   static getAllPost() {
//     return dbData.execute("SELECT * FROM posts");
//   }

//   static getSinglePost(id) {
//     return dbData.execute("SELECT * FROM posts where posts.id= ?", [id]);
//   }
// };

const Sequelize = require("sequelize");

const database = require("../utils/database");

const Post = database.define("post", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: { type: Sequelize.STRING, allowNull: false },
  description: { type: Sequelize.TEXT, allowNull: false },
  imgUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Post;

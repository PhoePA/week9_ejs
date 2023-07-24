// const { post } = require("../routes/admin");
// const mongodb = require("mongodb");
// const { getDatabase } = require("../utils/database");

// class Post {
//   constructor(title, description, imgUrl, id) {
//     this.title = title;
//     this.description = description;
//     this.imgUrl = imgUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//   }

//   create() {
//     const db = getDatabase();
//     let dbTmp;

//     if (this._id) {
//       // update post
//       dbTmp = db
//         .collection("posts")
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbTmp = db.collection("posts").insertOne(this);
//     }

//     return dbTmp
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static getPosts() {
//     const db = getDatabase();
//     return db
//       .collection("posts", { locale: "en", caseLevel: true })
//       .find()
//       .sort({ title: 1 })
//       .toArray()
//       .then((posts) => {
//         console.log(posts);
//         return posts;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static getPost(postId) {
//     const db = getDatabase();
//     return db
//       .collection("posts")
//       .find({ _id: new mongodb.ObjectId(postId) })
//       .next()
//       .then((post) => {
//         console.log(post);
//         return post;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static deletePostById(postId) {
//     const db = getDatabase();
//     return db
//       .collection("posts")
//       .deleteOne({ _id: new mongodb.ObjectId(postId) })
//       .then((result) => {
//         console.log("Post Deleted Successfully!");
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }

// module.exports = Post;

// using mongooseDB
const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
         type: String,
        required: true
    },
    imgUrl: {
         type: String,
        required: true
    },
})

module.exports = model("Post", postSchema);
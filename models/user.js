const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minLength: 3,
    maxLength: 15,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 4,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  payment_session_key: {
    type: String,
  },
  profile_imgUrl: {
    type: String,
  },
  resetToken: String,
  tokenExpireTime: Date,
});

module.exports = model("User", userSchema);

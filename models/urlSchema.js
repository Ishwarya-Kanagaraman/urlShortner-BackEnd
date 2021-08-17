// const mongoose = require("mongoose");
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNo: {
    type: Number,
    required: true,
  },
  confirm: {
    type: Boolean,
    default: false,
  },
  resetToken: String,
  expiryTime: Date,
  urlData: [
    {
     urlCode:String,
      longUrl: String,
      shortUrl: String,
      date: {
        type: String,
        default: Date.now,
      },
    },
  ],
});
export const  User=mongoose.model("user",userSchema);
// module.exports = mongoose.model("user", userSchema);
// const express = require("express");
import express from "express";
import {User} from "../models/urlSchema.js";
// import { Urls } from "../models/urls.js";
// const User = require("../models/urlSchema.js");

const router = express.Router();

router.route("/view/:code").get(async (req, res) => {
  let code = req.params.code;
  try {
    const url = await User.findOne({
      urlData: { $elemMatch: { urlCode: code } },
    });
        console.log("url is",url);
  
    if (url) {
      let x = url.urlData;
      let index = x.findIndex((x) => x.urlCode === code);
      console.log("index is ",index);
      return res.redirect(url.urlData[index].longUrl);
    } else {
      return res.status(404).json("No URL Found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server Error");
  }
});

// module.exports = redirectRouter;
export const redirectRouter=router;
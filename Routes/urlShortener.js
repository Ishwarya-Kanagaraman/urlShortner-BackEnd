// const express = require("express");
import express from "express";
import shortid from "shortid";
import validUrl from "valid-url";
import {User} from "../models/urlSchema.js";
// import { Urls } from "../models/urls.js";
// const validUrl = require("valid-url");
// const shortid = require("shortid");
// const User = require("../models/urlSchema.js");

const router = express.Router();

const baseUrl = "http://bit.ly/";

// Url Shortener
router.route("/shorten")
.post(async (request, response) => {
  const { longUrl, email } = request.body;

  if (!validUrl.isUri(baseUrl)) {
    return response.status(401).json("Invalid base URL");
  }

  const urlCode = shortid.generate();
  
const shortUrl=`${baseUrl}/${urlCode}`
  if (validUrl.isUri(longUrl)) {
    try {
      const url = await User.findOne({
        email
      });
      console.log("foundURL" ,url);
      url.urlData.push({
        longUrl,
        shortUrl,
        urlCode,
        date: new Date(),
      });
      await url.save();
      console.log("my Url is ",url.urlData)
      response.status(200).send({message:"Short Url Created successfully", url});
      // response.redirect('https://url-shortner-frontend.netlify.app/display');
    } catch (err) {
      console.log(err);
      response.status(500).json("Server Error");
    }
  } else {
    response.status(401).json("Invalid longUrl");
  }
});
export const shortnerRouter=router;
// module.exports = router;
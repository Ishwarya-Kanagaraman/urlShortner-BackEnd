// const express = require("express");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
// import {SECRET_KEY,USER,PASSWORD} from "../credentials.js";
// const {SECRET_KEY,USER,PASSWORD} =require('./credentials.js');



// const Users = require("../models/urlSchema.js")
import {User} from '../models/urlSchema.js'
// const dotenv=require('dotenv')
// dotenv.config();
const router = express.Router();
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // user:USER,
    // pass:PASSWORD,
    user: "ishwaryaraman324@gmail.com",
    pass: "um@r@m@n@&@))$",
  },
});

router
  .route("/users")
  // to get the details of Users
  .get(async (request, response) => {
    try {
      const usersList = await User.find();
      response.json(usersList);
      console.log(usersList);
    } catch (err) {
      response.send(err);
      console.log(err);
    }
  })

  // to delete specific User
  .delete(async (request, response) => {
    const { id } = request.body;
    try {
      const findUser = await User.findById({ _id: id });
      findUser.remove();
      response.send({ findUser, message: "deleted Successfully" });
    } catch (err) {
      console.log(err);
    }
  })
  
// to signup a user
router.route("/signup").post(async (request, response) => {
  const { firstName, lastName, email, password, mobileNo } = request.body;
  const findDuplicate = await User.findOne({ email: email });
  if (findDuplicate) {
    response.status(409);
    response.send("Email already exists!");
  } else {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        mobileNo,
      });
      await newUser.save();

      const token = jwt.sign({ id: newUser._id },"MySecretKey", {
        expiresIn: "1 day",
      });
      console.log("token is-->", token);
      console.log(newUser);
      let mail = await transporter.sendMail(
        {
          from: "xyz@gmail.com",
          to: `${newUser.email}`,
          subject: "(Do-not-reply) signup confirmation Mail",
          // text: 'Node.js testing mail'
          html: `<h1>Hi ${newUser.firstName} ${newUser.lastName},</h1><br/><h2>Welcome to Our Creators Insititute</h2><p>
            <a href="https://my-urlshortner-backend.herokuapp.com/verify?token=${token}">Click Here to activate your Account</a> `,
        }
    
      );
      console.log("mail is", mail);
      if (mail.accepted.length > 0) {
         response.send({ newUser, message: "Registration Success.kindly check email to activate your account!" });
      } else if (mail.rejected.length == 1) {
         response.send({ message: "Registration failed" });
      }
    } catch (err) {
      console.log(err);
    }
  }
});
// verify after signup
router.route("/verify").get(async (request, response) => {
  try {
    const token = request.query.token;
    if (token) {
      const { id } = jwt.verify(token,"MySecretKey");
     const user= await User.findOne({ _id: id });
      user.confirm=true;
      await user.save();
      response.send("Your account is activated Successfully!!!!");
      response.redirect(`https://url-shortner-frontend.netlify.app/login`);
    } else {
      response.status(401).json({ message: "Invalid Token" });
    }
  } catch (err) {
    console.log(err);
    response.status(500).send("Server Error");
  }
});

// login function tested 100%
router.route("/login").post(async (request, response) => {
  const { email, password } = request.body;
  try {
    const findUser = await User.findOne({ email: email });

    if (!findUser) {
      return response.status(401).send({ message: "Invalid credentials!" });
    }
    if (!findUser.confirm) {
      return response.status(401).send({ message: "Activate your account and try again" });
    }
  
    else if (findUser && (await bcrypt.compare(password, findUser.password))) {
      const genToken = jwt.sign({ id: findUser._id }, "secretKey");
      response.cookie("jwtToken", genToken, {
        sameSite: "strict",
        expires: new Date(new Date().getTime() + 3600 * 1000),
        httpOnly: true,
      });
      return response.status(200).json({ message: "Logged in Successfully !" })
      .redirect('https://url-shortner-frontend.netlify.app/shorten');
      
    } else {
      return response.status(401).send({ message: "Invalid credentials" });
    }
  } catch (err) {
    response.status(500).send(err);
    console.log(err);
  }
});
// forgot password function
router.route("/forgot-password").post(async (request, response) => {
  const { email } = request.body;
  try {
    const user = await User.findOne({ email: email });
console.log("user is",user)
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
        return response.status(500).send({ message: "Can't generate token" });
      }
      const token = buffer.toString("hex");
      if (!user) {
        response.send({
          message: `No user Found for this email ${email} Kindly Register and then try again `,
        });
      }
      user.resetToken = token;
      user.expiryTime = Date.now() + 3600000;
      await user.save();
      console.log("mail is going to be sent");
      let ForgotMail = await transporter.sendMail(
        {
          from: "ishwaryaraman324@gmail.com",
          to: `${user.email}`,
          subject: "Password reset",
          html: `<h4>Your request for password reset has been accepted </h4><br/> <p> To reset your password, 
           <a href="https://urlShortner-FrontEnd.netlify.app/reset-password/${token}"> click here </a>`,
        }
 
      );
      console.log("Forgotmail is", ForgotMail);
      if (ForgotMail.accepted.length > 0) {
         response.send({
          message: "Mail Sent for Forgot Password!",
        });
        console.log(user);
      } else if (ForgotMail.rejected.length == 1) {
         response.send({ message: "Errors" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});
// reset password function tested working 100%.
router.route('/reset-password')
.post(async (request, response) => {
  const { resetToken,newPassword } = request.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const newhashedPassword = await bcrypt.hash(newPassword, salt);
    const usersList = await User.findOne(
      {
        resetToken:resetToken
      },
    
    )
    console.log("found User by Token",usersList)
    if(usersList){
      usersList.password = newhashedPassword;
      usersList.resetToken=undefined;
      usersList.expiryTime=undefined;
      await usersList.save();
    }
    console.log("updated User by Token",usersList);
    response.send({message:"changed password successfully",usersList});
    response.redirect("https://urlShortner-FrontEnd.netlify.app/login");
    
  } catch (err) {
    response.send(err);
    console.log(err);
  }
})
// router.route('/home').get(AuthTest,(request,response)=>{
//    response.send(request.rootUser);
// })
export const userRouter=router;
// module.exports = router;

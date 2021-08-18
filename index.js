// const mongoose = require("mongoose");
// const express = require("express");
import express from "express";
import mongoose from "mongoose";
// require("dotenv").config();
// const {MONGO_URL} =require('./credentials.js');

// const cors = require("cors");
import cors from "cors";
import {shortnerRouter} from "./Routes/urlShortener.js";
import {redirectRouter} from "./Routes/urlRedirect.js";
import{ userRouter} from "./Routes/Authentication.js";
// const router = require("./Routes/Authentication.js");


const app = express();
const PORT = process.env.PORT || 3004;

// connection to mongodb through mongoose
// const url=MONGO_URL;
const url = 'mongodb+srv://ishwarya_23:Kuppu@1614013@cluster0.i7g84.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(`${url}`, { useNewUrlParser: true, useUnifiedTopology: true });
const con = mongoose.connection;
con.on("open", () => console.log("MongoDB is connected"));

// middleware

app.use(express.json());
app.use(cors());

// used Routes
app.use("/api/", redirectRouter);
app.use("/", userRouter);
app.use("/", shortnerRouter);

// general home page
app.get("/", (request, response) => {
  response.send("Welcome Ishwarya!");
});
app.listen(PORT, () => console.log(`server is started at ${PORT}`));

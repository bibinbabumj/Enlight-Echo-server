import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import jwt from "jsonwebtoken";
import {
  validateSignupData,
  mHashedPassword,
  sendFormatedUserData,
  mGenerateUserName,
  generateImageName,
  mVerfiyJWT,
} from "./utils/Utils.js";

import { validateBlogData, generateBlogId } from "./utils/PublishBlogUtils.js";
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import bcrypt from "bcrypt";
import cors from "cors";
import firebaseAdmin from "firebase-admin";
//import serviceAccount from "./enlighten-echo-blog.json" assert { type: 'json' };
import { createRequire } from "module";
//
import { handleGoogleAuth } from "./auth/GoogleAuth.js";
//

//AWS Connection
import aws from "aws-sdk";
import { nanoid } from "nanoid";

// AWS SDK v3 imports
//import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const require = createRequire(import.meta.url);
const serviceAccount = require("./enlighten-echo-blog.json");

const server = express();
let PORT = 3000;
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

server.use(express.json());
server.use(cors());
mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

//Setup Aws bucket
const s3Bucket = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
});

// // Configure AWS SDK v3
// const s3Bucket = new S3Client({
//   region: process.env.AWS_DEFAULT_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

//// image URl upload

const mGenerateUploadImageURL = async () => {
  const imageName = generateImageName();
  return await s3Bucket.getSignedUrlPromise("putObject", {
    Bucket: "enlighted-echo-blog",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

server.post("/signup", async (req, res) => {
  try {
    
    const { fullname, email, password } = req.body;
    const validationError = validateSignupData(fullname, email, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Hash the password
    const hashedPassword = await mHashedPassword(password);
    // Create username from email
    const username = await mGenerateUserName(email, User);
    const user = new User({
      user_info: {
        fullname: fullname,
        email: email,
        password: hashedPassword,
        username: username,
      },
    });

    user
      .save()
      .then((savedUser) => {
        return res
          .status(200)
          .json({ user_info: sendFormatedUserData(savedUser) });
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ error: "Email alreday exists" });
        }
        return res.status(500).json({ error: err });
      });
  } catch (error) {
    console.error("Error occurred during signup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

server.post("/signin", (req, res) => {
  let { email, password } = req.body;
  User.findOne({ "user_info.email": email })
    .then((user) => {
      if (!user) {
        console.log(user);
        return res.status(403).json({ error: "email not found" });
      }
      if (!user.google_auth) {
        bcrypt.compare(password, user.user_info.password, (error, result) => {
          if (error) {
            return res
              .status(403)
              .json({ error: "Error occured try agin later" });
          }

          if (!result) {
            return res.status(403).json({ error: "Incorrect password" });
          } else {
            return (
              res
                .status(200)
                //.json({ user_info: sendFormatedUserData(user) });
                .json(sendFormatedUserData(user))
            );
          }
        });
      } else {
        return res.status(403).json({
          error: "Account was created using google. Try logging in with google",
        });
      }
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/google-auth", async (req, res) => {
  try {
    let { access_token } = req.body;
    const mUser = await handleGoogleAuth(access_token);
    return res.status(200).json(sendFormatedUserData(mUser));
  } catch (error) {
    return res.status(500).json({
      error: "Failed to authenticate with Google. Try using another account",
    });
  }
});

///uploadimage url

server.get("/get-upload-url", (req, res) => {
  mGenerateUploadImageURL()
    .then((url) => {
      res.status(200).json({ uploadURL: url });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

server.post("/publish-blog", mVerfiyJWT, async (req, res) => {

  console.log("publish-blog")
  const userID = req.userId;
  const {
    blog_title,
    blog_banner_img_url,
    blog_content,
    blog_tags,
    blog_des,
    draft,
  } = req.body;
  const validationError = validateBlogData(
    blog_title,
    blog_banner_img_url,
    blog_content,
    draft
  );
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  //blog_tags=blog_tags.map(blog_tag=>blog_tag.toLowerCase())
  
  let blog_id = generateBlogId(blog_title);

  const mDbBlog = new Blog({
    blog_info: {
      blog_title,
      blog_banner_img_url,
      blog_content,
      blog_des,
    },
    blog_id,
    blog_tags: blog_tags.map(blog_tag => blog_tag.toLowerCase()),
    author: userID,
    draft,
  });

try{
   const mPublishedBlog= await mDbBlog.save()
   await User.findOneAndUpdate({ _id: userID},
    {
      $inc: { "user_account_info.total_bg_posts": draft ? 0 : 1 },
      $push: { blogs: mPublishedBlog._id }
    })
    res.status(200).json({ blog_id: mPublishedBlog.blog_id});

}catch(error){
  res.status(500).json({ error: "An error occurred while saving the blog post." });
}


});

server.listen(PORT, () => {
  console.log("listening on port->" + PORT);
});

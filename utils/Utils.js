const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

export const validateSignupData = (fullname, email, password) => {
  if (!fullname || fullname.length < 3) {
    return "Full name must be at least 3 characters long";
  }

  if (!email || !emailRegex.test(email)) {
    return "Invalid email";
  }

  if (!password || !passwordRegex.test(password)) {
    return "Password must contain at least one lowercase letter, one uppercase letter, one digit, and be at least 8 characters long";
  }

  return null;
};

export const mHashedPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.error("Error occurred during password hashing:", error);
    throw new Error("Error occurred during password hashing");
  }
};

export const mGenerateUserName = async (email,User) => {
  let username = email.split("@")[0];
  let isUsenameNotUnique = await User.exists({
    "user_info.username": username,
  }).then((result) => result);
  isUsenameNotUnique ? (username += nanoid().substring(0, 4)) : "";
  return username;
};

export const sendFormatedUserData = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img: user.user_info.profile_img,
    username: user.user_info.username,
    fullname: user.user_info.fullname,
  };
};

//// gnerateImagename

export const generateImageName = () => {
  const date = new Date();
  return `${nanoid()}-${date.getTime()}.jpeg`;
};


export const mVerfiyJWT=(req,res,next)=>{
  const authHeader=req.headers['authorization']
  if(!authHeader){
    return res.status(403).json({ error: "No access token provided" });
  }
  const authToken = authHeader.split(" ")[1];
  if (!authToken) {
    return res.status(403).json({ error: "No access token" });
  }
  jwt.verify(authToken,process.env.SECRET_ACCESS_KEY,(err,user)=>{
    if(err){
      return res.status(403).json({ error: "Invalid access token" });
    }

    req.userId=user.id
    next()
  })

}
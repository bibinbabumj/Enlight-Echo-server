import { getAuth} from "firebase-admin/auth";
import User from "../Schema/User.js";
import { mGenerateUserName} from "../utils/Utils.js";

export const handleGoogleAuth = async (access_token) => {
  try {

    
    const mAuthUser = await getAuth().verifyIdToken(access_token);
    const { email, name, picture } = mAuthUser;
    const highQualityPicture = picture.replace("s96-c", "s384-c");
    
    let mUser = await User.findOne({ "user_info.email": email }).select(
      "user_info.username user_info.fullname user_info.profile_img google_auth"
    );

   
    
    if (mUser) {
      
      // User exists, check if signed up with Google
      if (!mUser.google_auth) {
        return res.status(403).json({
          error:
            "This email was signed up without Google. Please log in with a password to access the account",
        });
      }
    } else {
      // Create a new user if not found
      const username = await mGenerateUserName(email,User);
      mUser = new User({
        user_info: {
          fullname: name,
          email: email,
          username: username,
          profile_img: highQualityPicture,
        },
        google_auth: true,
      });
      
      mUser = await mUser.save();
    }
    return mUser;

  } catch (error) {
    throw new Error("Failed to authenticate with Google. Try using another account");
  }
};


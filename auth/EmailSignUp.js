import { validateSignupData, mHashedPassword,sendFormatedUserData,mGenerateUserName } from "../utils/Utils";



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
      const username = await mGenerateUserName(email);
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


  const handleEmailSignUp=()=>{
    try{

    }catch(error){
      return res.status(500).json({ error: "Internal server error" });
    }
  }
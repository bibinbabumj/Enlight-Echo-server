import mongoose, { Schema } from "mongoose"


const userSchema=mongoose.Schema({
    user_account_info:{
        total_bg_posts: {
            type: Number,
            default: 0
        },
        total_bg_reads: {
            type: Number,
            default: 0
        },
    },

    blogs:{
        type:[Schema.Types.ObjectId],
        ref: 'Blogs',
        default: [],

    },


    user_info: {
        fullname: {
            type:String,
            lowercase:true,
            require:true,
            minlength:[3,'fullname must be 3 letters long']
        },
        email:{
            type:String,
            require:true,
            lowercase:true,
            unique:true
        },
        password: String,

        username:{
            type: String,
            minlength: [3, 'Username must be 3 letters long'],
            unique: true,
        },
        bio: {
            type: String,
            maxlength: [200, 'Bio should not be more than 200'],
            default: "",
        
        },
        profile_img: {
            type: String,
            default: () => {
                return "https://api.dicebear.com/8.x/lorelei/svg"
            } 
        }
    },

    google_auth: {
        type: Boolean,
        default: false
    },
    // social link

},{ 
    timestamps: {
        createdAt: 'joinedAt'
    } 

})

export default mongoose.model("User", userSchema);
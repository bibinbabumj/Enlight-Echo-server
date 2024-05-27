import mongoose, { Schema } from "mongoose";

const blogSchema = mongoose.Schema(
  {

    blog_info:{
        blog_title: {
            type: String,
            required: true,
          },
          blog_banner_img_url: {
            type: String,
           
          },
          blog_des: {
            type: String,
            maxlength: 200,
          },
          blog_content: {
            type: [],
            
          },
        
    },

    blog_id: {
      type: String,
      required: true,
      unique: true,
    },
    blog_tags: {
      type: [String],  
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },

    draft: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: {
      createdAt: "publishedAt",
    },
  }
);

export default mongoose.model("Blog", blogSchema);

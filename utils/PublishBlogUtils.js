import { nanoid } from "nanoid";

export const validateBlogData = (
  blog_title,
  blog_banner_img_url,
  blog_content,
  draft
) => {
  if (!blog_title) {
    return "There must a blog title";
  }
  if (!draft) {
    if (!blog_banner_img_url) {
      return "There must a blog banner";
    }
    if (!blog_content.blocks.length) {
      return "There must some blog content to publish it";
    }
  }

  return null;
};

export const generateBlogId = (blog_title) => {
  let blog_id = blog_title
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove non-alphanumeric characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .trim(); // Remove leading and trailing spaces
  blog_id += nanoid(); // Append nanoid for uniqueness
  return blog_id;
};

import UploadPost from "upload-post"

const API_KEY = process.env.UPLOAD_POST_API_KEY || ""

export const uploadPost = new UploadPost(API_KEY)

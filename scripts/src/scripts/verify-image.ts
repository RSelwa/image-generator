import { storage } from "../../../libs/providers/dist/firebase.js"

const bucket = storage.bucket("tiktok-generator-fa261.firebasestorage.app")
const file = bucket.file("sphericals/sphericals_1DjpNvVfyOVNepcAmRzT.webp")

// Check if file exists
const [exists] = await file.exists()
console.log("File exists:", exists)

if (exists) {
  await file.makePublic()
  console.log("File is now public")
}

import { refs } from "@repo/providers/db-refs"
import { storage } from "@repo/providers/firebase"
import {
  STORAGE_PATHS,
  TABLES,
} from "../../../libs/common/src/constants/firebase.ts"

const gameId = process.argv[2] || ""
const externalUrl = process.argv[3] || ""

if (!gameId || !externalUrl) {
  console.error(
    "Usage: deno run --allow-all upload-game-image.ts <gameId> <imageUrl>",
  )
  process.exit(1)
}

async function fetchAndUploadImage(url: string, destinationPath: string) {
  console.info(`📥 Fetching image from: ${url}`)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`,
    )
  }

  const contentType = response.headers.get("content-type") || "image/jpeg"
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  console.info(`📤 Uploading to Firebase Storage: ${destinationPath}`)

  const bucket = storage.bucket()
  const file = bucket.file(destinationPath)

  await file.save(buffer, {
    metadata: {
      contentType,
    },
  })

  // Make the file publicly accessible
  await file.makePublic()

  // Get the public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`

  console.info(`✅ Uploaded successfully: ${publicUrl}`)

  return publicUrl
}

async function updateGameStorageImage(gameId: string, storageUrl: string) {
  const gameRef = refs[TABLES.GAMES].doc(gameId)
  const gameSnapshot = await gameRef.get()

  if (!gameSnapshot.exists) {
    throw new Error(`Game with ID "${gameId}" not found`)
  }

  await gameRef.update({ storageImage: storageUrl })

  console.info(`✅ Updated game "${gameId}" with storageImage: ${storageUrl}`)
}

async function main() {
  try {
    console.info(`🎮 Processing game: ${gameId}`)

    // Extract file extension from URL or default to jpg
    const urlPath = new URL(externalUrl).pathname
    const extension = urlPath.split(".").pop() || "jpg"
    const fileName = `${gameId}.${extension}`
    const storagePath = `${STORAGE_PATHS.GAME_THUMBNAILS}/${fileName}`

    // Fetch and upload the image
    const storageUrl = await fetchAndUploadImage(externalUrl, storagePath)

    // Update the game document
    await updateGameStorageImage(gameId, storageUrl)

    console.info("🎉 Done!")
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

await main()

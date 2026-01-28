import { getImageUrl } from "../../../libs/common/dist/index.js"
import {
  PROJECT_ID,
  STORAGE_PATHS,
  TABLES,
} from "../../../libs/common/src/constants/firebase.ts"
import {
  collectionGroupRefs,
  refs,
  subRefs,
} from "../../../libs/providers/dist/db-refs.js"
import { storage } from "../../../libs/providers/dist/firebase.js"

const allGames = await refs[TABLES.GAMES].get()

const allNonDefinedGames = allGames.docs.filter(
  (doc) => !doc.data().storageImage,
)

const allSphericals = await collectionGroupRefs[TABLES.SPHERICAL].get()

const allNonDefinedSphericals = allSphericals.docs.filter(
  (doc) => !doc.data().storageImage,
)

const replaceGamesThumbnails = async (snapshot: any) => {
  try {
    if (!snapshot.exists) {
      throw new Error("Game not found")
    }
    const gameData = snapshot.data()

    const thumbnailUrl = getImageUrl(gameData?.thumbnailUrl)

    if (!thumbnailUrl) {
      throw new Error("No thumbnailUrl found for this game")
    }

    // Fetch the external image
    console.info(`📥 Fetching image from: ${thumbnailUrl}`)
    const response = await fetch(thumbnailUrl)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`,
      )
    }

    const contentType = response.headers.get("content-type") || "image/jpeg"
    const arrayBuffer = await response.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Get extension from content-type (e.g., "image/jpeg" -> "jpg", "image/png" -> "png")
    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    }
    const extension = extensionMap[contentType] || "jpg"
    const storagePath = `${STORAGE_PATHS.GAME_THUMBNAILS}/${snapshot.id}.${extension}`

    console.info(`📤 Uploading to Firebase Storage: ${storagePath}`)

    const bucket = storage.bucket(`${PROJECT_ID}.firebasestorage.app`)
    const file = bucket.file(storagePath)

    await file.save(buffer, {
      metadata: { contentType },
    })

    await file.makePublic()

    const storageImage = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

    console.info(`✅ Uploaded: ${storageImage}`)

    // Update the game document with storageImage
    await refs[TABLES.GAMES].doc(snapshot.id).update({ storageImage })

    console.info(`🎉 Game "${snapshot.id}" updated with storageImage`)
  } catch (error) {
    console.error("Error in replaceGamesThumbnails:", error)
  }
}

const replaceSphericalThumbnails = async (snapshot: any) => {
  try {
    console.log(snapshot.id)

    if (!snapshot.exists) {
      throw new Error("Spherical not found")
    }
    const sphericalData = snapshot.data()
    const gameId = sphericalData.gameId

    const thumbnailUrl = getImageUrl(sphericalData?.image)

    if (!thumbnailUrl) {
      throw new Error("No thumbnailUrl found for this game")
    }

    // Fetch the external image
    console.info(`📥 Fetching image from: ${thumbnailUrl}`)
    const response = await fetch(thumbnailUrl)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`,
      )
    }

    const contentType = response.headers.get("content-type") || "image/jpeg"
    const arrayBuffer = await response.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Get extension from content-type (e.g., "image/jpeg" -> "jpg", "image/png" -> "png")
    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    }
    const extension = extensionMap[contentType] || "jpg"
    const storagePath = `${STORAGE_PATHS.SPHERICALS}/${snapshot.id}.${extension}`

    console.info(`📤 Uploading to Firebase Storage: ${storagePath}`)

    const bucket = storage.bucket(`${PROJECT_ID}.firebasestorage.app`)
    const file = bucket.file(storagePath)

    await file.save(buffer, {
      metadata: { contentType },
    })

    await file.makePublic()

    const storageImage = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

    console.info(`✅ Uploaded: ${storageImage}`)

    // Update the game document with storageImage
    await subRefs[TABLES.SPHERICAL](gameId)
      .doc(snapshot.id)
      .update({ storageImage })

    console.info(`🎉 Game "${snapshot.id}" updated with storageImage`)
  } catch (error) {
    console.error("Error in replaceGamesThumbnails:", error)
  }
}

// await Promise.all(allGames.docs.map(async (doc) => replaceGamesThumbnails(doc)))
// await Promise.all(
//   allSphericals.docs.map(async (doc) => replaceSphericalThumbnails(doc)),
// )

console.log(allGames.size, allNonDefinedGames.length)
console.log(allSphericals.size, allNonDefinedSphericals.length)

// for (const doc of allNonDefinedGames) {
//   await replaceGamesThumbnails(doc)
// // }
// for (const doc of allNonDefinedSphericals) {
//   await replaceSphericalThumbnails(doc)
// }

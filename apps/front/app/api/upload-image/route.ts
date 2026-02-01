import { BUCKETS_ACTIONS, type ConstantValues } from "@repo/common"
import { getNowString, RIGHTS_CREATE_TO_BUCKETS, STORAGE_PATHS } from "@repo/common"
import { type RightDoc } from "@repo/schemas"
import sharp from "sharp"
import z from "zod"
import { storage } from "@/lib/firebase-admin"
import { getUserRight } from "@/utils/api"

export const payloadSchema = z.object({
  file: z.custom((v) => v, {
    error: "File is required",
  }),
  gameName: z.string().optional(),
  bucketPath: z.enum(STORAGE_PATHS, {
    error: "Invalid storage path",
  }),
})

const hasRightToUpload = (userRight: RightDoc["right"], bucketPath: ConstantValues<typeof STORAGE_PATHS>) => {
  const bucket = RIGHTS_CREATE_TO_BUCKETS[bucketPath].find(({ role }) => role === userRight)

  if (!bucket) return false

  return userRight === bucket.role && bucket.rights.includes(BUCKETS_ACTIONS.CREATE)
}

export const POST = async (request: Request) => {
  try {
    const right = await getUserRight(request)

    if ("error" in right) {
      console.error("Authentication error:", right.error)

      const status =
        "status" in right ? right.status : 500

      return Response.json(
        { error: right.error },
        { status },
      )
    }

    if (!hasRightToUpload(right.data.right, STORAGE_PATHS.MAP_IMAGES)) {
      // Authorized
      return Response.json(
        { error: "Authorized to write in this bucket" },
        { status: 401 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const gameName = formData.get("gameName")?.toString() || undefined
    const bucketPath = formData.get("bucketPath")?.toString() || undefined

    if (!file || !(file instanceof File) || !bucketPath) {
      return Response.json(
        { error: "Missing file or bucketPath" },
        { status: 400 },
      )
    }

    const dateStr = getNowString()

    const safeGameName = gameName ? gameName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") : "untitled"
    const extension = file?.name?.split(".").pop() || "jpg"
    const storagePath = `${bucketPath}/${safeGameName}-${dateStr}.${extension}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract image dimensions using sharp
    const metadata = await sharp(buffer).metadata()
    const width = metadata.width ?? null
    const height = metadata.height ?? null

    const bucket = storage.bucket()
    const fileRef = bucket.file(storagePath)

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    })

    await fileRef.makePublic()

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

    console.info(`Image saved as ${publicUrl} (${width}x${height})`)

    return Response.json({ url: publicUrl, width, height })
  } catch (error) {
    console.error("Upload error:", error)

    return Response.json({ error: "Failed to upload image" }, { status: 500 })
  }
}

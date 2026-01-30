import { storage } from "@/lib/firebase-admin"
import { verifyAdmin } from "@/utils/api"
import { STORAGE_PATHS, getNowString } from "@repo/common"
import sharp from "sharp"
import z from "zod"

export const payloadSchema = z.object({
  file: z.custom((v) => v, {
    error: "File is required",
  }),
  gameName: z.string().optional(),
  bucketPath: z.enum(STORAGE_PATHS, {
    error: "Invalid storage path",
  }),
})

export async function POST(request: Request) {
  try {
    const authResult = await verifyAdmin(request)
    if ("error" in authResult) {
      console.error("Authentication error:", authResult.error)
      
      return Response.json(
        { error: authResult.error },
        { status: authResult.status },
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

    const dateStr =getNowString()

    const safeGameName = gameName
      ? gameName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      : "untitled"
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

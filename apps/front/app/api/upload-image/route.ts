import { auth, db, storage } from "@/lib/firebase-admin"
import { STORAGE_PATHS, TABLES, USERS_RIGHTS } from "@repo/common"
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

const verifyAdmin = async (request: Request) => {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 }
  }

  const token = authHeader.slice(7)

  try {
    const decodedToken = await auth.verifyIdToken(token)
    const userDoc = await db
      .collection(TABLES.USERS)
      .doc(decodedToken.uid)
      .get()

    if (!userDoc.exists) {
      return { error: "User not found", status: 404 }
    }

    const userData = userDoc.data()
    if (userData?.rights !== USERS_RIGHTS.ADMIN) {
      return { error: "Forbidden: Admin access required", status: 403 }
    }

    return { uid: decodedToken.uid }
  } catch {
    return { error: "Invalid or expired token", status: 401 }
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAdmin(request)
    if ("error" in authResult) {
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

    const now = new Date()
    const dateStr = [
      now.getDate().toString().padStart(2, "0"),
      (now.getMonth() + 1).toString().padStart(2, "0"),
      now.getFullYear(),
      now.getHours().toString().padStart(2, "0"),
      now.getMinutes().toString().padStart(2, "0"),
      now.getSeconds().toString().padStart(2, "0"),
    ].join("-")

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

    const bucket = storage.bucket()
    const fileRef = bucket.file(storagePath)

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    })

    await fileRef.makePublic()

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

    console.info(`Image saved as ${publicUrl}`)

    return Response.json({ url: publicUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return Response.json({ error: "Failed to upload image" }, { status: 500 })
  }
}

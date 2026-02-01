import { TABLES } from "@repo/common"
import { rightDocSchema } from "@repo/schemas"
import { auth, db } from "@/lib/firebase-admin"

export const getUserRight = async (request: Request) => {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 }
  }

  const token = authHeader.slice(7)

  try {
    const decodedToken = await auth.verifyIdToken(token)
    const rightDoc = await db
      .collection(TABLES.RIGHTS)
      .doc(decodedToken.uid)
      .get()

    if (!rightDoc.exists) {
      return { error: "User has no rights", status: 404 }
    }

    const userData = rightDoc.data()

    const right = rightDocSchema.safeParse(userData)

    if (!right.success) {
      return { error: "Invalid user rights data", status: 500 }
    }

    return right
  } catch {
    return { error: "Invalid or expired token", status: 401 }
  }
}

import { auth, db } from "@/lib/firebase-admin"
import { TABLES, USERS_RIGHTS } from "@repo/common"

export const verifyAdmin = async (request: Request) => {
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
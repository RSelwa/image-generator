import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"

export const GET = async () => {
  try {
    const snapshot = await refs[TABLES.GAMES].get()

    const games = snapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      image: doc.data().image || "",
      alternateNames: doc.data().alternateNames || [],
    }))

    return Response.json({ games })
  } catch (error) {
    console.error("Error fetching games for seed maker:", error)

    return new Response("Internal Server Error", { status: 500 })
  }
}

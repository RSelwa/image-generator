import { DOCUMENTS_STATUS, TABLES } from "@repo/common"
import { subRefs } from "@repo/providers/db-refs"
import { type NextRequest } from "next/server"

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
) => {
  try {
    const { gameId } = await params

    if (!gameId) {
      return new Response("Missing gameId", { status: 400 })
    }

    const [sphericalsSnapshot, flatsSnapshot, mapsSnapshot] = await Promise.all([
      subRefs[TABLES.SPHERICAL](gameId)
        .where("status", "==", DOCUMENTS_STATUS.READY)
        .get(),
      subRefs[TABLES.FLAT](gameId)
        .where("status", "==", DOCUMENTS_STATUS.READY)
        .get(),
      subRefs[TABLES.MAPS](gameId).get(),
    ])

    const sphericals = sphericalsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const flats = flatsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const maps = mapsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return Response.json({ sphericals, flats, maps })
  } catch (error) {
    console.error("Error fetching ready data for game:", error)

    return new Response("Internal Server Error", { status: 500 })
  }
}

import { DEFAULT_MAX_DISTANCE_POINTS, TABLES } from "@repo/common"
import { collectionGroupRefs, subRefs } from "@repo/providers/db-refs"

const allMaps = await collectionGroupRefs[TABLES.MAPS].get()

if (allMaps.empty) {
  throw new Error("No maps found")
}

await Promise.all(
  allMaps.docs.map(async (map) => {
    const mapData = map.data()

    if (!mapData.gameId) {
      console.warn(`Map ${map.id} has no gameId, skipping`)

      return
    }
    if (!mapData.maxDistancePoints) {
      await subRefs[TABLES.MAPS](mapData.gameId).doc(map.id).update({
        maxDistancePoints: DEFAULT_MAX_DISTANCE_POINTS,
      })

      console.info(`Updated map ${map.id} with maxDistancePoints`)
    }
  })
)

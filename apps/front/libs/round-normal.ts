import { ROUND_TYPE, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { roundSchema, type SphericalDocWithId } from "@repo/schemas"

export const formatSphericalsForNormalRounds = async (sphericals: SphericalDocWithId[]) => {
  const formattedSphericals = await Promise.all(sphericals.map(async (spherical) => {
    try {
      const gameId = spherical.gameId
      const mapId = spherical.mapId

      if (!gameId) {
        console.warn(`Spherical ${spherical.id} does not have a gameId.`)

        return null
      }

      if (!mapId) {
        console.warn(`Spherical ${spherical.id} does not have a mapId.`)

        return null
      }

      const [gameSnapshot, mapSnapshot] = await Promise.all([
        refs[TABLES.GAMES].doc(gameId).get(),
        subRefs[TABLES.MAPS](gameId).doc(mapId).get(),
      ])

      if (!gameSnapshot.exists) {
        console.warn(`Related game : ${gameId} doc not found for spherical:`, spherical.id)

        return null
      }

      if (!mapSnapshot.exists) {
        console.warn(`Related map : ${mapId} doc not found for spherical: /${gameId}/${spherical.id}`)

        return null
      }

      const gameData = gameSnapshot.data()
      const mapData = mapSnapshot.data()

      if (!gameData || !mapData) {
        console.warn(`Game data or map data is null for spherical: ${spherical.id}`)

        return null
      }

      const parsedRound = roundSchema.safeParse({
        isSpecial: false,

        type: ROUND_TYPE.SPHERICAL,
        gameId,
        gameTitle: gameData.title,
        gameThumbnailUrl: gameData.image,

        sphericalId: spherical.id,
        sphericalImageUrl: spherical.image,

        mapId,
        mapPosition: spherical.mapPosition,
        mapImage: mapData.imageUrl,
        mapWidth: mapData.width,
        mapHeight: mapData.height,
      })

      if (!parsedRound.success) {
        console.error("Failed to parse round data:", parsedRound.error)

        return null
      }

      return parsedRound.data
    } catch (error) {
      console.error("Error formatting spherical for normal round:", error instanceof Error ? error.message : error)

      return null
    }
  }))

  const filteredRounds = formattedSphericals.filter((round) => round !== null)

  return (filteredRounds)
}

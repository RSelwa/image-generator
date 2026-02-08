import { ROUND_TYPE, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type FlatDocWithId, specialRoundOptionSchema, type SphericalDocWithId } from "@repo/schemas"

export const formatSphericalsForSpecialRounds = async (sphericals: SphericalDocWithId[]) => {
  const formattedSphericalsOption = await Promise.all(sphericals.map(async (spherical) => {
    try {
      const gameId = spherical.gameId
      const thumbnail = spherical.thumbnail

      if (!gameId) {
        console.warn(`Spherical ${spherical.id} does not have a gameId.`)

        return null
      }

      if (!thumbnail) {
        console.warn(`Spherical ${spherical.id} does not have a thumbnail.`)

        return null
      }

      const gameSnapshot = await refs[TABLES.GAMES].doc(gameId).get()

      if (!gameSnapshot.exists) {
        console.warn(`Related game : ${gameId} doc not found for spherical:`, spherical.id)

        return null
      }

      const gameData = gameSnapshot.data()

      if (!gameData) {
        console.warn(`Game data is null for spherical: ${spherical.id}`)

        return null
      }

      const parsedRoundOption = specialRoundOptionSchema.safeParse({
        type: ROUND_TYPE.SPHERICAL,

        gameId,
        gameTitle: gameData.title,
        gameThumbnailUrl: gameData.image,

        thumbnailUrl: thumbnail,

        sphericalId: spherical.id,
        sphericalImage: spherical.image,
      })

      if (!parsedRoundOption.success) {
        console.error("Failed to parse round data:", parsedRoundOption.error)

        return null
      }

      return parsedRoundOption.data
    } catch (error) {
      console.error("Error formatting spherical for normal round:", error instanceof Error ? error.message : error)

      return null
    }
  }))

  const filteredOptions = formattedSphericalsOption.filter((round) => round !== null)

  return (filteredOptions)
}

export const formatFlatsForSpecialRounds = async (flats: FlatDocWithId[]) => {
  const formattedFlatsOption = await Promise.all(flats.map(async (flat) => {
    try {
      const gameId = flat.gameId
      const thumbnail = flat.thumbnail

      if (!gameId) {
        console.warn(`Flat ${flat.id} does not have a gameId.`)

        return null
      }

      if (!thumbnail) {
        console.warn(`Flat ${flat.id} does not have a thumbnail.`)

        return null
      }

      const gameSnapshot = await refs[TABLES.GAMES].doc(gameId).get()

      if (!gameSnapshot.exists) {
        console.warn(`Related game : ${gameId} doc not found for Flat:`, flat.id)

        return null
      }

      const gameData = gameSnapshot.data()

      if (!gameData) {
        console.warn(`Game data is null for flat: ${flat.id}`)

        return null
      }

      const parsedRoundOption = specialRoundOptionSchema.safeParse({
        type: ROUND_TYPE.FLAT,

        gameId,
        gameTitle: gameData.title,
        gameThumbnailUrl: gameData.image,

        thumbnailUrl: thumbnail,

        flatId: flat.id,
        flatImage: flat.image,
      })

      if (!parsedRoundOption.success) {
        console.error("Failed to parse round data:", parsedRoundOption.error)

        return null
      }

      return parsedRoundOption.data
    } catch (error) {
      console.error("Error formatting spherical for normal round:", error instanceof Error ? error.message : error)

      return null
    }
  }))

  const filteredOptions = formattedFlatsOption.filter((round) => round !== null)

  return (filteredOptions)
}

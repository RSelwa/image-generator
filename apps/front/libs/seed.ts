import { DOCUMENTS_STATUS, SPECIAL_ROUND_OPTIONS_COUNT, TABLES } from "@repo/common"
import { collectionGroupRefs } from "@repo/providers/db-refs"
import { type Round, roundSchema } from "@repo/schemas"
import { formatSphericalsForNormalRounds } from "@/libs/round-normal"
import { formatFlatsForSpecialRounds, formatSphericalsForSpecialRounds } from "@/libs/round-special"

export const generateSeedRounds = async ({ numberOfRounds, hasSpecialRounds }: { numberOfRounds: number, hasSpecialRounds: boolean }) => {
  try {
    const [sphericalsWithMap, sphericalsWithThumbnails, flatWithThumbnails] = await Promise.all([
      collectionGroupRefs[TABLES.SPHERICAL].where("status", "==", DOCUMENTS_STATUS.READY)
        .where("mapId", ">", "")
        .get(),

      collectionGroupRefs[TABLES.SPHERICAL].where("status", "==", DOCUMENTS_STATUS.READY)
        .where("thumbnail", ">", "")
        .get(),

      collectionGroupRefs[TABLES.SPHERICAL].where("status", "==", DOCUMENTS_STATUS.READY)
        .where("thumbnail", ">", "")
        .get(),
    ])

    const sphericalsWithMapData = sphericalsWithMap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const sphericalsWithThumbnailsData = sphericalsWithThumbnails.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const flatsWithThumbnailsData = flatWithThumbnails.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    const [formattedSphericalsForNormalRounds, formattedSphericalsForSpecialRounds, formattedFlatsForSpecialRounds] = await Promise.all([
      formatSphericalsForNormalRounds(sphericalsWithMapData),
      formatSphericalsForSpecialRounds(sphericalsWithThumbnailsData),
      formatFlatsForSpecialRounds(flatsWithThumbnailsData),
    ])

    const rounds: Round[] = []

    for (let index = 0; index < numberOfRounds; index++) {
      const isRoundSpecial = hasSpecialRounds ? (index + 1) % 6 === 0 : false // Every 6th round is special

      const excludedGameIds = (rounds.map((round) => round.gameId || round?.options?.map((option) => option.gameId)).flat())

      if (isRoundSpecial) {
        const options: Round["options"] = []

        for (let i = 0; i < SPECIAL_ROUND_OPTIONS_COUNT; i++) {
          const specialRoundOptions = [...formattedSphericalsForSpecialRounds, ...formattedFlatsForSpecialRounds].filter(
            (option) => option && !excludedGameIds.includes(option.gameId)
          )

          if (specialRoundOptions.length === 0) {
            console.warn("No more suitable options found for special round generation.")

            continue
          }

          const randomOption = specialRoundOptions[Math.floor(Math.random() * specialRoundOptions.length)]

          options.push(randomOption)
        }
        const round = roundSchema.safeParse({
          isSpecial: true,
          options
        })

        if (!round.success) {
          console.error("Failed to parse special round data:", round.error)

          continue
        }

        rounds.push(round.data)
      }

      const sphericalFiltered = formattedSphericalsForNormalRounds.filter((spherical) => spherical.gameId && !excludedGameIds.includes(spherical.gameId))

      if (sphericalFiltered.length === 0) {
        console.warn("No more suitable round found for round generation.")

        continue
      }

      const randomSpherical = sphericalFiltered[Math.floor(Math.random() * sphericalFiltered.length)]

      const round = roundSchema.safeParse({
        isSpecial: false,

        type: randomSpherical.type,
        gameId: randomSpherical.gameId,
        gameTitle: randomSpherical.gameTitle,
        gameThumbnailUrl: randomSpherical.gameThumbnailUrl,

        sphericalId: randomSpherical.sphericalId,
        sphericalImageUrl: randomSpherical.sphericalImageUrl,

        mapId: randomSpherical.mapId,
        mapPosition: randomSpherical.mapPosition,
        mapImage: randomSpherical.mapImage,
        mapWidth: randomSpherical.mapWidth,
        mapHeight: randomSpherical.mapHeight,
        maxDistancePoints: randomSpherical.maxDistancePoints,

      })

      if (!round.success) {
        console.error("Failed to parse round data:", round.error)

        continue
      }

      rounds.push(round.data)
    }

    return rounds
  } catch (error) {
    console.error("Error generating seed rounds:", error instanceof Error ? error.message : error)

    return []
  }
}

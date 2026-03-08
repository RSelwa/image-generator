import { DOCUMENTS_STATUS, NUMBER_OF_ROUNDS_PER_STAGE, SPECIAL_ROUND_OPTIONS_COUNT, TABLES } from "@repo/common"
import { collectionGroupRefs } from "@repo/providers/db-refs"
import { type Round, roundSchema } from "@repo/schemas"
import { formatFlatsForNormalRounds, formatSphericalsForNormalRounds } from "@/libs/round-normal"
import { formatFlatsForSpecialRounds, formatSphericalsForSpecialRounds } from "@/libs/round-special"

export const generateSeedRounds = async ({ numberOfRounds, hasSpecialRounds, recentlyPlayedGameIds = [] }: { numberOfRounds: number, hasSpecialRounds: boolean, recentlyPlayedGameIds?: string[] }) => {
  try {
    const [sphericalsWithMap, flatsWithMap, sphericalsWithThumbnails, flatWithThumbnails] = await Promise.all([
      collectionGroupRefs[TABLES.SPHERICAL].where("status", "==", DOCUMENTS_STATUS.READY)
        .where("mapId", ">", "")
        .get(),
      collectionGroupRefs[TABLES.FLAT].where("status", "==", DOCUMENTS_STATUS.READY)
        .where("mapId", ">", "")
        .get(),
      hasSpecialRounds ? collectionGroupRefs[TABLES.SPHERICAL].where("status", "==", DOCUMENTS_STATUS.READY)
        .where("thumbnail", ">", "")
        .get() : { docs: [] },
      hasSpecialRounds ? collectionGroupRefs[TABLES.FLAT].where("status", "==", DOCUMENTS_STATUS.READY)
        .where("thumbnail", ">", "")
        .get() : { docs: [] },
    ])

    const sphericalsWithMapData = sphericalsWithMap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const flatsWithMapData = flatsWithMap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const sphericalsWithThumbnailsData = sphericalsWithThumbnails.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const flatsWithThumbnailsData = flatWithThumbnails.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    const [formattedSphericalsForNormalRounds, formattedFlatsForNormalRounds, formattedSphericalsForSpecialRounds, formattedFlatsForSpecialRounds] = await Promise.all([
      formatSphericalsForNormalRounds(sphericalsWithMapData),
      formatFlatsForNormalRounds(flatsWithMapData),
      formatSphericalsForSpecialRounds(sphericalsWithThumbnailsData),
      formatFlatsForSpecialRounds(flatsWithThumbnailsData),
    ])

    const rounds: Round[] = []

    for (let index = 0; index < numberOfRounds; index++) {
      const isRoundSpecial = hasSpecialRounds ? (index + 1) % NUMBER_OF_ROUNDS_PER_STAGE === 0 : false // Every 6th round is special
      const excludedGameIds = (rounds.map((round) => round.gameId || round?.options?.map((option) => option.gameId)).flat())

      if (isRoundSpecial) {
        const options: Round["options"] = []

        for (let i = 0; i < SPECIAL_ROUND_OPTIONS_COUNT; i++) {
          const excludedOptionIds = options.map((option) => option.gameId)
          const allExcludedIds = [...new Set([...excludedGameIds, ...excludedOptionIds])]

          const allSpecialOptions = [...formattedSphericalsForSpecialRounds, ...formattedFlatsForSpecialRounds]

          // Prioritize sphericals over flats for special rounds
          const sphericalOptions = formattedSphericalsForSpecialRounds.filter(
            (option) => option && !allExcludedIds.includes(option.gameId) && !recentlyPlayedGameIds.includes(option.gameId)
          )
          const allFilteredOptions = allSpecialOptions.filter(
            (option) => option && !allExcludedIds.includes(option.gameId) && !recentlyPlayedGameIds.includes(option.gameId)
          )
          const specialRoundOptions = sphericalOptions.length > 0 ? sphericalOptions : allFilteredOptions

          let randomOption

          if (specialRoundOptions.length === 0) {
            // Fallback: drop recently played exclusion, but keep current seed exclusion
            const sphericalFallback = formattedSphericalsForSpecialRounds.filter(
              (option) => option && !allExcludedIds.includes(option.gameId)
            )
            const allFallback = allSpecialOptions.filter(
              (option) => option && !allExcludedIds.includes(option.gameId)
            )
            const fallbackOptions = sphericalFallback.length > 0 ? sphericalFallback : allFallback

            if (fallbackOptions.length === 0) {
              console.warn("No more suitable options found for special round generation.")

              continue
            }

            randomOption = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)]
          } else {
            randomOption = specialRoundOptions[Math.floor(Math.random() * specialRoundOptions.length)]
          }

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

        continue
      }

      const allNormalRounds = [...formattedSphericalsForNormalRounds, ...formattedFlatsForNormalRounds]
      const normalRoundsFiltered = allNormalRounds.filter((round) => round.gameId && !excludedGameIds.includes(round.gameId) && !recentlyPlayedGameIds.includes(round.gameId))

      let randomRound

      if (normalRoundsFiltered.length === 0) {
        // Fallback: drop recently played exclusion, but keep current seed exclusion to avoid duplicates within this seed
        const fallbackFiltered = allNormalRounds.filter((round) => round.gameId && !excludedGameIds.includes(round.gameId))

        if (fallbackFiltered.length === 0) {
          console.warn("No more suitable round found for round generation.")

          continue
        }

        randomRound = fallbackFiltered[Math.floor(Math.random() * fallbackFiltered.length)]
      } else {
        randomRound = normalRoundsFiltered[Math.floor(Math.random() * normalRoundsFiltered.length)]
      }

      const round = roundSchema.safeParse({
        isSpecial: false,

        type: randomRound.type,
        gameId: randomRound.gameId,
        gameTitle: randomRound.gameTitle,
        gameAlternateNames: randomRound.gameAlternateNames,
        gameThumbnailUrl: randomRound.gameThumbnailUrl,

        sphericalId: randomRound.sphericalId,
        sphericalImageUrl: randomRound.sphericalImageUrl,

        flatId: randomRound.flatId,
        flatImageUrl: randomRound.flatImageUrl,

        mapId: randomRound.mapId,
        mapPosition: randomRound.mapPosition,
        mapImage: randomRound.mapImage,
        mapWidth: randomRound.mapWidth,
        mapHeight: randomRound.mapHeight,
        maxDistancePoints: randomRound.maxDistancePoints,

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

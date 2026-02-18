import { DEFAULT_MAX_DISTANCE_POINTS, DEMO_SEED_ID, DIFFICULTIES, DOCUMENTS_STATUS, mockedGameImageURL, mockedSphericalImageURL, ROUND_TYPE, SPECIAL_ROUND_OPTIONS_COUNT, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { gameDocWithIdSchema, type Round, roundSchema } from "@repo/schemas"
import { createFirestoreDoc } from "@repo/testing/emulator"
import { flatFactory, gameFactory, mapFactory, seedFactory, sphericalFactory } from "@repo/testing/factory"

const GAME_TITLES = [
  "TEST-Minecraft",
  "TEST-Fortnite",
  "TEST-The Legend of Zelda",
  "TEST-Super Mario Bros",
  "TEST-Grand Theft Auto",
  "TEST-Red Dead Redemption",
  "TEST-The Witcher",
  "TEST-Skyrim",
  "TEST-Dark Souls",
  "TEST-Elden Ring",
  "TEST-God of War",
  "TEST-Halo",
  "TEST-Call of Duty",
  "TEST-Overwatch",
  "TEST-League of Legends",
  "TEST-Valorant",
  "TEST-Counter Strike",
  "TEST-Apex Legends",
  "TEST-Rocket League",
  "TEST-Among Us",
  "TEST-Fall Guys",
  "TEST-Pokemon",
  "TEST-Animal Crossing",
  "TEST-Stardew Valley",
  "TEST-Hollow Knight",
  "TEST-Celeste",
  "TEST-Hades",
  "TEST-Cuphead",
  "TEST-Terraria",
  "TEST-Roblox",
  "TEST-World of Warcraft",
  "TEST-Final Fantasy",
  "TEST-Resident Evil",
  "TEST-Silent Hill",
  "TEST-Metal Gear Solid",
  "TEST-Uncharted",
  "TEST-The Last of Us",
  "TEST-Horizon Zero Dawn",
  "TEST-Spider Man",
  "TEST-Batman Arkham",
  "TEST-Assassins Creed",
  "TEST-Far Cry",
  "TEST-Bioshock",
  "TEST-Portal",
  "TEST-Half Life",
  "TEST-Team Fortress",
  "TEST-Doom",
  "TEST-Cyberpunk",
  "TEST-Starfield",
  "TEST-Baldurs Gate",
]

export const generateGameData = async () => {
  const games = GAME_TITLES.map((title) => {
    const game = gameFactory({ title, alternateNames: [`${title}-alternate1`, `${title}-alternate2`] })
    const map = mapFactory({ gameId: game.id })
    const sphericalWithMap = sphericalFactory({ gameId: game.id, mapId: map.id, status: DOCUMENTS_STATUS.READY, mapPosition: { x: 50, y: 50 } })
    const sphericalWithThumbnail = sphericalFactory({ gameId: game.id, thumbnail: mockedSphericalImageURL, status: DOCUMENTS_STATUS.READY })
    const flat = flatFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY, thumbnail: mockedGameImageURL })
    const flatWithMap = flatFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY, thumbnail: mockedGameImageURL, mapId: map.id, mapPosition: { x: 50, y: 50 } })
   

    return { game, map, sphericalWithMap, sphericalWithThumbnail, flat, flatWithMap }
  })

  await Promise.all(
    games.map(({ game: fields }) => createFirestoreDoc(refs[TABLES.GAMES], fields)),
  )

  await Promise.all(
    games.flatMap(({ game, map, sphericalWithMap, sphericalWithThumbnail, flat, flatWithMap }) => {
      const { id: mapId, ...mapFields } = map
      const { id: sphericalMapId, ...sphericalMapFields } = sphericalWithMap
      const { id: sphericalThumbId, ...sphericalThumbFields } = sphericalWithThumbnail
      const { id: flatId, ...flatFields } = flat
      const { id: flatMapId, ...flatMapFields } = flatWithMap

      return [
        createFirestoreDoc(subRefs[TABLES.MAPS](game.id), { id: mapId, ...mapFields }),
        createFirestoreDoc(
          subRefs[TABLES.SPHERICAL](game.id),
          { ...sphericalMapFields, id: sphericalMapId },
        ),
        createFirestoreDoc(
          subRefs[TABLES.SPHERICAL](game.id),
          { id: sphericalThumbId, ...sphericalThumbFields },
        ),
        createFirestoreDoc(subRefs[TABLES.FLAT](game.id), { id: flatId, ...flatFields }),
        createFirestoreDoc(subRefs[TABLES.FLAT](game.id), { id: flatMapId, ...flatMapFields }),
      ]
    }),
  )

  return {
    games: gameDocWithIdSchema.array().parse(games.map(({ game }) => game)),
    gameEntries: games,
  }
}

type GeneratedGameData = Awaited<ReturnType<typeof generateGameData>>

export const createDemoSeedData = async ({ gameEntries }: GeneratedGameData) => {
  const rounds: Round[] = []

  for (let i = 0; i < 6; i++) {
    const entry = gameEntries[i]
    const isSpecial = i === 5

    if (isSpecial) {
      const options = Array.from({ length: SPECIAL_ROUND_OPTIONS_COUNT }, (_, optionIndex) => {
        const optionEntry = gameEntries[6 + optionIndex]

        return {
          type: ROUND_TYPE.SPHERICAL,
          gameId: optionEntry.game.id,
          gameTitle: optionEntry.game.title,
          gameAlternateNames: optionEntry.game.alternateNames,
          gameThumbnailUrl: optionEntry.game.image,
          thumbnailUrl: mockedSphericalImageURL,
          sphericalId: optionEntry.sphericalWithThumbnail.id,
          sphericalImage: optionEntry.sphericalWithThumbnail.image,
        }
      })

      const parsed = roundSchema.parse({
        isSpecial: true,
        options,
        difficulty: DIFFICULTIES.EASY,
      })

      rounds.push(parsed)

      continue
    }

    const parsed = roundSchema.parse({
      isSpecial: false,
      type: ROUND_TYPE.SPHERICAL,
      gameId: entry.game.id,
      gameTitle: entry.game.title,
      gameAlternateNames: entry.game.alternateNames,
      gameThumbnailUrl: entry.game.image,
      sphericalId: entry.sphericalWithMap.id,
      sphericalImageUrl: entry.sphericalWithMap.image,
      mapId: entry.map.id,
      mapPosition: entry.sphericalWithMap.mapPosition,
      mapImage: entry.map.imageUrl,
      mapWidth: entry.map.width,
      mapHeight: entry.map.height,
      maxDistancePoints: entry.map.maxDistancePoints || DEFAULT_MAX_DISTANCE_POINTS,
      difficulty: DIFFICULTIES.EASY,
    })

    rounds.push(parsed)
  }

  const seed = seedFactory({
    id: DEMO_SEED_ID,
    name: "Demo Seed",
    rounds,
  })

  await createFirestoreDoc(refs[TABLES.SEEDS], seed)
}
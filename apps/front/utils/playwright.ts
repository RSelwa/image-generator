import { DOCUMENTS_STATUS, mockedGameImageURL, mockedSphericalImageURL, TABLES } from "@repo/common"
import { createFirestoreDoc, toFirestoreFields } from "@repo/testing/emulator"
import { flatFactory, gameFactory, mapFactory, sphericalFactory } from "@repo/testing/factory"

const GAME_TITLES = [
  "Minecraft",
  "Fortnite",
  "The Legend of Zelda",
  "Super Mario Bros",
  "Grand Theft Auto",
  "Red Dead Redemption",
  "The Witcher",
  "Skyrim",
  "Dark Souls",
  "Elden Ring",
  "God of War",
  "Halo",
  "Call of Duty",
  "Overwatch",
  "League of Legends",
  "Valorant",
  "Counter Strike",
  "Apex Legends",
  "Rocket League",
  "Among Us",
  "Fall Guys",
  "Pokemon",
  "Animal Crossing",
  "Stardew Valley",
  "Hollow Knight",
  "Celeste",
  "Hades",
  "Cuphead",
  "Terraria",
  "Roblox",
  "World of Warcraft",
  "Final Fantasy",
  "Resident Evil",
  "Silent Hill",
  "Metal Gear Solid",
  "Uncharted",
  "The Last of Us",
  "Horizon Zero Dawn",
  "Spider Man",
  "Batman Arkham",
  "Assassins Creed",
  "Far Cry",
  "Bioshock",
  "Portal",
  "Half Life",
  "Team Fortress",
  "Doom",
  "Cyberpunk",
  "Starfield",
  "Baldurs Gate",
]

export const generateGameData = async () => {
  const games = GAME_TITLES.map((title) => {
    const game = gameFactory({ title })
    const map = mapFactory({ gameId: game.id })
    const sphericalWithMap = sphericalFactory({ gameId: game.id, mapId: map.id })
    const sphericalWithThumbnail = sphericalFactory({ gameId: game.id, thumbnail: mockedSphericalImageURL })
    const flat = flatFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY, thumbnail: mockedGameImageURL })

    return { game, map, sphericalWithMap, sphericalWithThumbnail, flat }
  })

  await Promise.all(
    games.map(({ game: { id, ...fields } }) => createFirestoreDoc(TABLES.GAMES, id, toFirestoreFields(fields))),
  )

  await Promise.all(
    games.flatMap(({ game, map, sphericalWithMap, sphericalWithThumbnail, flat }) => {
      const { id: mapId, ...mapFields } = map
      const { id: sphericalMapId, ...sphericalMapFields } = sphericalWithMap
      const { id: sphericalThumbId, ...sphericalThumbFields } = sphericalWithThumbnail
      const { id: flatId, ...flatFields } = flat

      return [
        createFirestoreDoc(`${TABLES.GAMES}/${game.id}/${TABLES.MAPS}`, mapId, toFirestoreFields(mapFields)),
        createFirestoreDoc(
          `${TABLES.GAMES}/${game.id}/${TABLES.SPHERICAL}`,
          sphericalMapId,
          toFirestoreFields(sphericalMapFields),
        ),
        createFirestoreDoc(
          `${TABLES.GAMES}/${game.id}/${TABLES.SPHERICAL}`,
          sphericalThumbId,
          toFirestoreFields(sphericalThumbFields),
        ),
        createFirestoreDoc(`${TABLES.GAMES}/${game.id}/${TABLES.FLAT}`, flatId, toFirestoreFields(flatFields)),
      ]
    }),
  )

  return games
}

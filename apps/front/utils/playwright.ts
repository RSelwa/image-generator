import { DOCUMENTS_STATUS, mockedGameImageURL, mockedSphericalImageURL, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { createFirestoreDoc } from "@repo/testing/emulator"
import { flatFactory, gameFactory, mapFactory, sphericalFactory } from "@repo/testing/factory"

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
    const game = gameFactory({ title })
    const map = mapFactory({ gameId: game.id })
    const sphericalWithMap = sphericalFactory({ gameId: game.id, mapId: map.id, status: DOCUMENTS_STATUS.READY })
    const sphericalWithThumbnail = sphericalFactory({ gameId: game.id, thumbnail: mockedSphericalImageURL, status: DOCUMENTS_STATUS.READY })
    const flat = flatFactory({ gameId: game.id, status: DOCUMENTS_STATUS.READY, thumbnail: mockedGameImageURL })

    return { game, map, sphericalWithMap, sphericalWithThumbnail, flat }
  })

  await Promise.all(
    games.map(({ game: fields }) => createFirestoreDoc(refs[TABLES.GAMES], fields)),
  )

  await Promise.all(
    games.flatMap(({ game, map, sphericalWithMap, sphericalWithThumbnail, flat }) => {
      const { id: mapId, ...mapFields } = map
      const { id: sphericalMapId, ...sphericalMapFields } = sphericalWithMap
      const { id: sphericalThumbId, ...sphericalThumbFields } = sphericalWithThumbnail
      const { id: flatId, ...flatFields } = flat

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
      ]
    }),
  )

  return games
}

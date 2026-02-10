import { faker } from "@faker-js/faker"
import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { DIFFICULTIES, ROUND_TYPE } from "@repo/common"
import { type Round, type SeedDocWithId } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"
import { type FactoryDoc } from "~/orm"

export const seedFactory: FactoryDoc<SeedDocWithId> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  name: "",
  createdBy: null,
  timesUsed: 0,
  createdAt: Timestamp.fromDate(faker.date.past()) as unknown as ClientTimestamp,
  updatedAt: Timestamp.fromDate(faker.date.recent()) as unknown as ClientTimestamp,
  rounds: [],
  ...item
})

export const roundFactory: FactoryDoc<Round> = (item = {}) => ({
  isSpecial: false,
  type: ROUND_TYPE.SPHERICAL,

  gameId: faker.database.mongodbObjectId(),
  gameTitle: faker.lorem.words(3),
  gameThumbnailUrl: faker.image.url(),

  sphericalId: faker.database.mongodbObjectId(),
  sphericalImageUrl: faker.image.url(),

  flatId: faker.database.mongodbObjectId(),
  flatImageUrl: faker.image.url(),

  mapId: faker.database.mongodbObjectId(),
  mapPosition: {
    x: 50,
    y: 50,
  },
  mapImage: faker.image.url(),
  mapWidth: 1000,
  mapHeight: 1000,
  maxDistancePoints: 50,

  options: null,

  difficulty: DIFFICULTIES.EASY,

  ...item
})

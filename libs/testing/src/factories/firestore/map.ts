import { faker } from "@faker-js/faker"
import { Timestamp } from "@firebase/firestore"
import { mockedMapImageURL } from "@repo/common"
import { type MapDoc } from "@repo/schemas"
import { type FactoryDoc } from "~/orm"

export const mapFactory: FactoryDoc<MapDoc & { id: string }> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  gameId: faker.database.mongodbObjectId(),
  createdAt: Timestamp.fromDate(faker.date.past()),
  updatedAt: Timestamp.fromDate(faker.date.recent()),
  imageUrl: mockedMapImageURL,
  width: 828,
  height: 828,
  name: faker.lorem.words(2),
  ...item
})

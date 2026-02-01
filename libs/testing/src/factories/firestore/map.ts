import { faker } from "@faker-js/faker"
import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { mockedMapImageURL } from "@repo/common"
import { type MapDoc } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"
import { type FactoryDoc } from "~/orm"

export const mapFactory: FactoryDoc<MapDoc & { id: string }> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  gameId: faker.database.mongodbObjectId(),
  createdAt: Timestamp.fromDate(faker.date.past()) as unknown as ClientTimestamp,
  updatedAt: Timestamp.fromDate(faker.date.recent()) as unknown as ClientTimestamp,
  imageUrl: mockedMapImageURL,
  width: 828,
  height: 828,
  name: faker.lorem.words(2),
  ...item
})

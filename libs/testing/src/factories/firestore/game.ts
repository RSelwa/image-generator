import { faker } from "@faker-js/faker"
import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { mockedGameImageURL } from "@repo/common"
import { type GameDoc } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"
import { type FactoryDoc } from "~/orm"

export const gameFactory: FactoryDoc<GameDoc & { id: string }> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  createdAt: Timestamp.fromDate(faker.date.past()) as unknown as ClientTimestamp,
  updatedAt: Timestamp.fromDate(faker.date.recent()) as unknown as ClientTimestamp,
  title: faker.lorem.words(3),
  description: faker.lorem.sentence(),
  image: mockedGameImageURL,
  hasSpecialImagesReady: false,
  hasSphericalImagesReady: false,
  alternateName: "",
  midName: "",
  ...item
})

import { faker } from "@faker-js/faker"
import { Timestamp } from "@firebase/firestore"
import { mockedGameImageURL } from "@repo/common"
import { type GameDoc } from "@repo/schemas"
import { type FactoryDoc } from "~/orm"

export const gameFactory: FactoryDoc<GameDoc & { id: string }> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  createdAt: Timestamp.fromDate(faker.date.past()),
  updatedAt: Timestamp.fromDate(faker.date.recent()),
  title: faker.lorem.words(3),
  description: faker.lorem.sentence(),
  image: mockedGameImageURL,
  hasSpecialImagesReady: false,
  hasSphericalImagesReady: false,
  alternateName: "",
  midName: "",
  ...item
})

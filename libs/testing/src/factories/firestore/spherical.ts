import { faker } from "@faker-js/faker"
import { Timestamp } from "@firebase/firestore"
import { mockedSphericalImageURL } from "@repo/common"
import { type SphericalDoc } from "@repo/schemas"
import { type FactoryDoc } from "~/orm"

export const sphericalFactory: FactoryDoc<SphericalDoc & { id: string }> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  gameId: faker.database.mongodbObjectId(),
  image: mockedSphericalImageURL,
  createdAt: Timestamp.fromDate(faker.date.past()),
  updatedAt: Timestamp.fromDate(faker.date.recent()),
  difficulty: "easy",
  status: "waiting",
  ...item
})

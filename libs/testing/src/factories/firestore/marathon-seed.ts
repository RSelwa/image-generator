import { faker } from "@faker-js/faker"
import { type MarathonSeedDocWithId } from "@repo/schemas"
import { type FactoryDoc } from "~/orm"

export const marathonSeedFactory: FactoryDoc<MarathonSeedDocWithId> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  name: faker.lorem.words(3),
  rounds: [],
  createdAt: null,
  updatedAt: null,
  ...item,
})

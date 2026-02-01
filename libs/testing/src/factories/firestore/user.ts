import { faker } from "@faker-js/faker"
import { Timestamp } from "@firebase/firestore"
import { type UserDoc } from "@repo/schemas"
import { type FactoryDoc } from "~/orm"

export const userFactory: FactoryDoc<UserDoc & { id: string }> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  createdAt: Timestamp.fromDate(faker.date.past()),
  updatedAt: Timestamp.fromDate(faker.date.recent()),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  ...item
})

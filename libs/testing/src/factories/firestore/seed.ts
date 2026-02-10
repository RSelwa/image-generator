import { faker } from "@faker-js/faker"
import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { type SeedDocWithId } from "@repo/schemas"
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

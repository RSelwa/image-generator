import { faker } from "@faker-js/faker"
import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { AVATARS_KEYS } from "@repo/common"
import { type UserDoc } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"
import { type FactoryDoc } from "~/orm"

export const userFactory: FactoryDoc<UserDoc & { id: string }> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  createdAt: Timestamp.fromDate(faker.date.past()) as unknown as ClientTimestamp,
  updatedAt: Timestamp.fromDate(faker.date.recent()) as unknown as ClientTimestamp,
  email: faker.internet.email(),
  pseudo: faker.person.fullName(),
  avatar: faker.helpers.arrayElement(Object.values(AVATARS_KEYS)),
  isAnonymousUser: false,
  ...item
})

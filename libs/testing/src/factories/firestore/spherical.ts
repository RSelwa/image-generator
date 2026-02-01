import { faker } from "@faker-js/faker"
import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { DIFFICULTIES, DOCUMENTS_STATUS, mockedSphericalImageURL } from "@repo/common"
import { type SphericalDoc } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"
import { type FactoryDoc } from "~/orm"

export const sphericalFactory: FactoryDoc<SphericalDoc & { id: string }> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  gameId: faker.database.mongodbObjectId(),
  image: mockedSphericalImageURL,
  createdAt: Timestamp.fromDate(faker.date.past()) as unknown as ClientTimestamp,
  updatedAt: Timestamp.fromDate(faker.date.recent()) as unknown as ClientTimestamp,
  difficulty: DIFFICULTIES.EASY,
  status: DOCUMENTS_STATUS.WAITING,
  ...item
})

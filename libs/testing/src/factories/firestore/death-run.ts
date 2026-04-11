import { faker } from "@faker-js/faker"
import { DEATH_RUN_LIVES, DEATH_RUN_STATUS } from "@repo/common"
import { type DeathRunDocWithId, type DeathRunRunDocWithId } from "@repo/schemas"
import { type FactoryDoc } from "~/orm"

export const deathRunFactory: FactoryDoc<DeathRunDocWithId> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  code: faker.string.alpha({ length: 6 }).toUpperCase(),
  hostId: faker.database.mongodbObjectId(),
  seedId: null,
  status: DEATH_RUN_STATUS.WAITING,
  players: [],
  playersIds: [],
  lives: DEATH_RUN_LIVES,
  startedAt: null,
  createdAt: null,
  updatedAt: null,
  ...item,
})

export const deathRunRunFactory: FactoryDoc<DeathRunRunDocWithId> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  uid: faker.database.mongodbObjectId(),
  score: 0,
  currentRoundIndex: 0,
  answers: [],
  livesRemaining: DEATH_RUN_LIVES,
  startedAt: null,
  finishedAt: null,
  ...item,
})

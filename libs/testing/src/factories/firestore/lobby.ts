import { faker } from "@faker-js/faker"
import { type Timestamp as ClientTimestamp } from "@firebase/firestore"
import { DEFAULT_HAS_SPECIAL_ROUNDS, DEFAULT_LIVES, DEFAULT_NUMBERS_ROUNDS, DEFAULT_TIME_PER_ROUND, LOBBY_STATUS, MAX_PLAYERS } from "@repo/common"
import { type LobbyDoc } from "@repo/schemas"
import { Timestamp } from "firebase-admin/firestore"
import { type FactoryDoc } from "~/orm"

export const lobbyFactory: FactoryDoc<LobbyDoc & { id: string }> = (item = {}) => ({
  id: faker.database.mongodbObjectId(),
  createdAt: Timestamp.fromDate(faker.date.past()) as unknown as ClientTimestamp,
  updatedAt: Timestamp.fromDate(faker.date.recent()) as unknown as ClientTimestamp,
  code: faker.string.alpha({ length: 6 }).toUpperCase(),
  hostId: faker.database.mongodbObjectId(),
  players: [],
  status: LOBBY_STATUS.WAITING,
  config: {
    playersLives: DEFAULT_LIVES,
    hasSpecialRounds: DEFAULT_HAS_SPECIAL_ROUNDS,
    maxPlayers: MAX_PLAYERS,
    roundDuration: DEFAULT_TIME_PER_ROUND,
    numberOfRounds: DEFAULT_NUMBERS_ROUNDS,
  },
  seedId: null,
  maximumPossiblePoints: 0,
  currentRound: 0,
  currentRoundData: null,
  roundStartedAt: null,

  ...item
})

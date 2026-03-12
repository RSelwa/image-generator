import { dateToString, METADATA_DOCS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type DailyChallengeDoc, type DailyChallengeDocWithId } from "@repo/schemas"
import { createFirestoreDoc } from "@repo/testing/emulator"
import {
  dailyChallengeFactory,
  dailyChallengeFlatWithMapFactory,
  dailyChallengeFlatWithoutMapFactory,
  dailyChallengeSphericalWithMapFactory,
  dailyChallengeSphericalWithoutMapFactory,
} from "@repo/testing/factory"

const getDateString = (daysOffset: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)

  return dateToString(date)
}

export const createDailyChallenge = async (challenge: DailyChallengeDoc & { id: string }) => {
  await createFirestoreDoc(refs[TABLES.DAILY_CHALLENGES], challenge)

  return challenge
}

export const createGamesListMetadata = async (games: { id: string, title: string }[]) => {
  await refs[TABLES.METADATA].doc(METADATA_DOCS.GAMES_LIST).set({ games })
}

export const setupDailyChallengesForPath = async () => {
  const challenges: (DailyChallengeDocWithId)[] = []

  for (let i = 0; i <= 4; i++) {
    const date = getDateString(-i)
    const challenge = dailyChallengeFactory(i, { date })
    challenges.push(challenge)
  }

  const gamesList = challenges.map((c) => ({ id: c.gameId || "", title: c.gameTitle || "" }))

  await createGamesListMetadata(gamesList)

  for (const challenge of challenges) {
    await createDailyChallenge(challenge)
  }

  return challenges
}

export const setupSphericalWithMapChallenge = async (date?: string) => {
  const d = date || getDateString(0)
  const challenge = dailyChallengeSphericalWithMapFactory({ date: d })

  await createGamesListMetadata([{ id: challenge.gameId || "", title: challenge.gameTitle || "" }])
  await createDailyChallenge(challenge)

  return challenge
}

export const setupSphericalWithoutMapChallenge = async (date?: string) => {
  const d = date || getDateString(0)
  const challenge = dailyChallengeSphericalWithoutMapFactory({ date: d })

  await createGamesListMetadata([{ id: challenge.gameId || "", title: challenge.gameTitle || "" }])
  await createDailyChallenge(challenge)

  return challenge
}

export const setupFlatWithMapChallenge = async (date?: string) => {
  const d = date || getDateString(0)
  const challenge = dailyChallengeFlatWithMapFactory({ date: d })

  await createGamesListMetadata([{ id: challenge.gameId || "", title: challenge.gameTitle || "" }])
  await createDailyChallenge(challenge)

  return challenge
}

export const setupFlatWithoutMapChallenge = async (date?: string) => {
  const d = date || getDateString(0)
  const challenge = dailyChallengeFlatWithoutMapFactory({ date: d })

  await createGamesListMetadata([{ id: challenge.gameId || "", title: challenge.gameTitle || "" }])
  await createDailyChallenge(challenge)

  return challenge
}

import { faker } from "@faker-js/faker"
import { DEFAULT_MAX_DISTANCE_POINTS, DIFFICULTIES, mockedGameImageURL, mockedImageURL, mockedMapImageURL, mockedSphericalImageURL } from "@repo/common"
import { type DailyChallengeDoc } from "@repo/schemas"
import { type FactoryDoc } from "~/orm"

const baseDailyChallengeFields = (item: Partial<DailyChallengeDoc> = {}): DailyChallengeDoc => ({
  date: item.date || faker.date.recent().toISOString().split("T")[0] || "2026-03-11",
  gameId: faker.database.mongodbObjectId(),
  gameTitle: faker.lorem.words(3),
  gameAlternateNames: [],
  gameThumbnailUrl: mockedGameImageURL,
  difficulty: DIFFICULTIES.EASY,
  isSpherical: false,
  sphericalId: null,
  sphericalImageUrl: null,
  flatId: null,
  flatImageUrl: null,
  mapId: null,
  mapImage: null,
  mapPosition: null,
  mapWidth: null,
  mapHeight: null,
  maxDistancePoints: null,
  ...item,
})

const mapFields = () => ({
  mapId: faker.database.mongodbObjectId(),
  mapImage: mockedMapImageURL,
  mapPosition: { x: 50, y: 50 },
  mapWidth: 828,
  mapHeight: 828,
  maxDistancePoints: DEFAULT_MAX_DISTANCE_POINTS,
})

export const dailyChallengeSphericalWithMapFactory: FactoryDoc<DailyChallengeDoc & { id: string }> = (item = {}) => {
  const base = baseDailyChallengeFields({
    isSpherical: true,
    sphericalId: faker.database.mongodbObjectId(),
    sphericalImageUrl: mockedSphericalImageURL,
    ...mapFields(),
    ...item,
  })

  return { ...base, id: base.date }
}

export const dailyChallengeSphericalWithoutMapFactory: FactoryDoc<DailyChallengeDoc & { id: string }> = (item = {}) => {
  const base = baseDailyChallengeFields({
    isSpherical: true,
    sphericalId: faker.database.mongodbObjectId(),
    sphericalImageUrl: mockedSphericalImageURL,
    ...item,
  })

  return { ...base, id: base.date }
}

export const dailyChallengeFlatWithMapFactory: FactoryDoc<DailyChallengeDoc & { id: string }> = (item = {}) => {
  const base = baseDailyChallengeFields({
    isSpherical: false,
    flatId: faker.database.mongodbObjectId(),
    flatImageUrl: mockedImageURL,
    ...mapFields(),
    ...item,
  })

  return { ...base, id: base.date }
}

export const dailyChallengeFlatWithoutMapFactory: FactoryDoc<DailyChallengeDoc & { id: string }> = (item = {}) => {
  const base = baseDailyChallengeFields({
    isSpherical: false,
    flatId: faker.database.mongodbObjectId(),
    flatImageUrl: mockedImageURL,
    ...item,
  })

  return { ...base, id: base.date }
}

const DAILY_CHALLENGE_FACTORIES = [
  dailyChallengeSphericalWithMapFactory,
  dailyChallengeSphericalWithoutMapFactory,
  dailyChallengeFlatWithMapFactory,
  dailyChallengeFlatWithoutMapFactory,
] as const

export const dailyChallengeFactory = (index: number, item: Partial<DailyChallengeDoc> = {}) =>
  DAILY_CHALLENGE_FACTORIES[index % DAILY_CHALLENGE_FACTORIES.length]!(item)

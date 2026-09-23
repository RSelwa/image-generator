import { faker } from "@faker-js/faker"
import { type APIRequestContext, expect, test } from "@playwright/test"
import { ACHIEVEMENT_KEYS, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { userFactory } from "@repo/testing/factory"
import { PASSWORD } from "../helpers/lobby"

const ENDPOINT = "/api/achievements/events"
const REWARD = 50
const AUTH_EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099"

const CHANGE_USERNAME_EVENT = {
  key: ACHIEVEMENT_KEYS.CHANGE_USERNAME,
  before: { pseudo: "old-pseudo" },
  after: { pseudo: "new-pseudo" },
}

const signUp = async (credentials: { email?: string; password?: string }) => {
  const response = await fetch(
    `http://${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...credentials, returnSecureToken: true }),
    },
  )
  const { localId, idToken } = (await response.json()) as {
    localId: string
    idToken: string
  }

  return { uid: localId, idToken }
}

const signUpWithEmail = () =>
  signUp({
    email: faker.internet.email({ provider: "yopmail.com" }).toLowerCase(),
    password: PASSWORD,
  })

const signUpAnonymously = () => signUp({})

const postEvent = (
  request: APIRequestContext,
  data: unknown,
  idToken?: string,
) =>
  request.post(ENDPOINT, {
    data,
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
  })

const getCredits = async (uid: string) => {
  const user = await refs[TABLES.USERS].doc(uid).get()

  return user.data()?.credits
}

const getUnlocked = (uid: string) =>
  subRefs[TABLES.UNLOCKED_ACHIEVEMENTS](uid)
    .doc(ACHIEVEMENT_KEYS.CHANGE_USERNAME)
    .get()

test.describe.configure({ mode: "serial" })

test.describe("when an achievement event is posted", () => {
  test.beforeEach(async () => {
    await refs[TABLES.ACHIEVEMENTS].doc(ACHIEVEMENT_KEYS.CHANGE_USERNAME).set({
      key: ACHIEVEMENT_KEYS.CHANGE_USERNAME,
      name: "New identity",
      description: "Change your username",
      reward: REWARD,
    })
  })

  test("should reject a request without a token", async ({ request }) => {
    const response = await postEvent(request, CHANGE_USERNAME_EVENT)

    expect(response.status()).toBe(401)
  })

  test("should reject a request with an invalid token", async ({ request }) => {
    const response = await postEvent(
      request,
      CHANGE_USERNAME_EVENT,
      "not-a-token",
    )

    expect(response.status()).toBe(401)
  })

  test("should reject an invalid payload", async ({ request }) => {
    const { idToken } = await signUpWithEmail()

    const response = await postEvent(
      request,
      { key: ACHIEVEMENT_KEYS.CHANGE_USERNAME },
      idToken,
    )

    expect(response.status()).toBe(400)
  })

  test("should reject a payload carrying a uid", async ({ request }) => {
    const { idToken } = await signUpWithEmail()

    const response = await postEvent(
      request,
      { ...CHANGE_USERNAME_EVENT, uid: "someone-else" },
      idToken,
    )

    expect(response.status()).toBe(400)
  })

  test("should reject an unchanged username without a reward", async ({
    request,
  }) => {
    const { uid, idToken } = await signUpWithEmail()

    const response = await postEvent(
      request,
      { ...CHANGE_USERNAME_EVENT, after: CHANGE_USERNAME_EVENT.before },
      idToken,
    )

    expect(response.status()).toBe(422)
    expect(await getCredits(uid)).toBe(0)
    expect((await getUnlocked(uid)).exists).toBe(false)
  })

  test("should answer 404 when the achievement does not exist", async ({
    request,
  }) => {
    const { uid, idToken } = await signUpWithEmail()
    await refs[TABLES.ACHIEVEMENTS]
      .doc(ACHIEVEMENT_KEYS.CHANGE_USERNAME)
      .delete()

    const response = await postEvent(request, CHANGE_USERNAME_EVENT, idToken)

    expect(response.status()).toBe(404)
    expect(await getCredits(uid)).toBe(0)
  })

  test("should unlock the achievement and add its reward to the credits", async ({
    request,
  }) => {
    const { uid, idToken } = await signUpWithEmail()

    const response = await postEvent(request, CHANGE_USERNAME_EVENT, idToken)

    expect(response.status()).toBe(201)
    expect(await getCredits(uid)).toBe(REWARD)
    expect((await getUnlocked(uid)).data()?.reward).toBe(REWARD)
  })

  test("should pay the reward once when the event is sent twice", async ({
    request,
  }) => {
    const { uid, idToken } = await signUpWithEmail()

    await postEvent(request, CHANGE_USERNAME_EVENT, idToken)
    const response = await postEvent(request, CHANGE_USERNAME_EVENT, idToken)

    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ unlocked: false })
    expect(await getCredits(uid)).toBe(REWARD)
  })

  test("should pay the reward once when the event is sent concurrently", async ({
    request,
  }) => {
    const { uid, idToken } = await signUpWithEmail()

    const responses = await Promise.all([
      postEvent(request, CHANGE_USERNAME_EVENT, idToken),
      postEvent(request, CHANGE_USERNAME_EVENT, idToken),
    ])

    expect(
      responses.map((response) => response.status()).toSorted((a, b) => a - b),
    ).toEqual([200, 201])
    expect(await getCredits(uid)).toBe(REWARD)
  })

  test("should unlock the achievement for an anonymous user", async ({
    request,
  }) => {
    const { uid, idToken } = await signUpAnonymously()
    const {
      id: _,
      credits: __,
      ...anonymousUser
    } = userFactory({
      isAnonymousUser: true,
    })
    await refs[TABLES.USERS].doc(uid).set(anonymousUser, { merge: true })

    const response = await postEvent(request, CHANGE_USERNAME_EVENT, idToken)

    expect(response.status()).toBe(201)
    expect(await getCredits(uid)).toBe(REWARD)
  })
})

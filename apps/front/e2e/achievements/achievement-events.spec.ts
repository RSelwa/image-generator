import { faker } from "@faker-js/faker"
import { type APIRequestContext, expect, test } from "@playwright/test"
import { ACHIEVEMENT_KEYS, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { signUpAuthUser } from "@repo/testing/emulator"
import { userFactory } from "@repo/testing/factory"
import { PASSWORD } from "../helpers/lobby"

const ENDPOINT = "/api/achievements/events"
const REWARD = 50

const CHANGE_USERNAME_EVENT = {
  key: ACHIEVEMENT_KEYS.CHANGE_USERNAME,
  before: { pseudo: "old-pseudo" },
  after: { pseudo: "new-pseudo" },
}

const signUpWithEmail = () =>
  signUpAuthUser({
    email: faker.internet.email({ provider: "yopmail.com" }).toLowerCase(),
    password: PASSWORD,
  })

const signUpAnonymously = () => signUpAuthUser({})

const postEvent = (
  request: APIRequestContext,
  data: unknown,
  idToken?: string,
) =>
  request.post(ENDPOINT, {
    data,
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
  })

const storeNewPseudo = (uid: string) =>
  refs[TABLES.USERS]
    .doc(uid)
    .update({ pseudo: CHANGE_USERNAME_EVENT.after.pseudo })

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
      name: "New identity",
      description: "Change your username",
      reward: REWARD,
    })
  })

  test.describe("when the token is missing or invalid", () => {
    test("should reject a request without a token", async ({ request }) => {
      const response = await postEvent(request, CHANGE_USERNAME_EVENT)

      expect(response.status()).toBe(401)
    })

    test("should reject a request with an invalid token", async ({
      request,
    }) => {
      const response = await postEvent(
        request,
        CHANGE_USERNAME_EVENT,
        "not-a-token",
      )

      expect(response.status()).toBe(401)
    })
  })

  test.describe("when the payload is invalid", () => {
    test("should reject a payload without before and after", async ({
      request,
    }) => {
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
  })

  test.describe("when the achievement does not exist", () => {
    test("should answer 404 without a reward", async ({ request }) => {
      const { uid, idToken } = await signUpWithEmail()
      await refs[TABLES.ACHIEVEMENTS]
        .doc(ACHIEVEMENT_KEYS.CHANGE_USERNAME)
        .delete()

      const response = await postEvent(request, CHANGE_USERNAME_EVENT, idToken)

      expect(response.status()).toBe(404)
      expect(await getCredits(uid)).toBe(0)
    })
  })

  test.describe("when the change username event is posted", () => {
    test.describe("when the username is unchanged", () => {
      test("should reject it without a reward", async ({ request }) => {
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
    })

    test.describe("when the new username is stored", () => {
      test("should unlock the achievement and add its reward to the credits", async ({
        request,
      }) => {
        const { uid, idToken } = await signUpWithEmail()
        await storeNewPseudo(uid)

        const response = await postEvent(
          request,
          CHANGE_USERNAME_EVENT,
          idToken,
        )

        expect(response.status()).toBe(201)
        expect(await getCredits(uid)).toBe(REWARD)
        expect((await getUnlocked(uid)).data()?.reward).toBe(REWARD)
      })

      test("should pay the reward once when the event is sent twice", async ({
        request,
      }) => {
        const { uid, idToken } = await signUpWithEmail()
        await storeNewPseudo(uid)

        await postEvent(request, CHANGE_USERNAME_EVENT, idToken)
        const response = await postEvent(
          request,
          CHANGE_USERNAME_EVENT,
          idToken,
        )

        expect(response.status()).toBe(200)
        expect(await response.json()).toEqual({ unlocked: false })
        expect(await getCredits(uid)).toBe(REWARD)
      })

      test("should pay the reward once when the event is sent concurrently", async ({
        request,
      }) => {
        const { uid, idToken } = await signUpWithEmail()
        await storeNewPseudo(uid)

        const responses = await Promise.all([
          postEvent(request, CHANGE_USERNAME_EVENT, idToken),
          postEvent(request, CHANGE_USERNAME_EVENT, idToken),
        ])

        expect(
          responses
            .map((response) => response.status())
            .toSorted((a, b) => a - b),
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
          pseudo: CHANGE_USERNAME_EVENT.after.pseudo,
        })
        await refs[TABLES.USERS].doc(uid).set(anonymousUser, { merge: true })

        const response = await postEvent(
          request,
          CHANGE_USERNAME_EVENT,
          idToken,
        )

        expect(response.status()).toBe(201)
        expect(await getCredits(uid)).toBe(REWARD)
      })
    })
  })
})

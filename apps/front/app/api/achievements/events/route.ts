import { TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { auth, db } from "@repo/providers/firebase"
import {
  type AchievementEvent,
  achievementDocSchema,
  achievementEventSchema,
  userDocSchema,
} from "@repo/schemas"
import { FieldValue } from "firebase-admin/firestore"
import { isAchievementEventVerified } from "@/utils/achievement-events"

const BEARER_PREFIX = "Bearer "

const UNLOCK_RESULT = {
  UNLOCKED: "unlocked",
  ALREADY_UNLOCKED: "already_unlocked",
  USER_NOT_FOUND: "user_not_found",
  EVENT_NOT_VERIFIED: "event_not_verified",
} as const

const getVerifiedUid = async (request: Request) => {
  const authHeader = request.headers.get("Authorization") || ""

  if (!authHeader.startsWith(BEARER_PREFIX)) return null

  try {
    const { uid } = await auth.verifyIdToken(
      authHeader.slice(BEARER_PREFIX.length),
    )

    return uid
  } catch {
    return null
  }
}

const unlockAchievement = (
  uid: string,
  event: AchievementEvent,
  reward: number,
) =>
  db.runTransaction(async (transaction) => {
    const { key } = event
    const userRef = refs[TABLES.USERS].doc(uid)
    const unlockedRef = subRefs[TABLES.UNLOCKED_ACHIEVEMENTS](uid).doc(key)

    const [user, unlocked] = await Promise.all([
      transaction.get(userRef),
      transaction.get(unlockedRef),
    ])

    if (!user.exists) return UNLOCK_RESULT.USER_NOT_FOUND
    if (unlocked.exists) return UNLOCK_RESULT.ALREADY_UNLOCKED

    const storedUser = userDocSchema.parse(user.data())

    if (!isAchievementEventVerified(key, event, storedUser)) {
      return UNLOCK_RESULT.EVENT_NOT_VERIFIED
    }

    transaction.create(unlockedRef, {
      key,
      achievedAt: FieldValue.serverTimestamp(),
      reward,
    })
    transaction.update(userRef, { credits: FieldValue.increment(reward) })

    return UNLOCK_RESULT.UNLOCKED
  })

export const POST = async (request: Request) => {
  try {
    const uid = await getVerifiedUid(request)

    if (!uid) return new Response("You need to be logged", { status: 401 })

    const body = await request.json().catch(() => null)
    const parsed = achievementEventSchema.safeParse(body)

    if (!parsed.success) {
      return new Response("Invalid payload", { status: 400 })
    }

    const event = parsed.data

    const achievementSnapshot = await refs[TABLES.ACHIEVEMENTS]
      .doc(event.key)
      .get()

    if (!achievementSnapshot.exists) {
      return new Response("Achievement not found", { status: 404 })
    }

    const achievement = achievementDocSchema.safeParse(
      achievementSnapshot.data(),
    )

    if (!achievement.success) {
      console.error("Invalid achievement doc:", achievement.error)

      return new Response("Internal Server Error", { status: 500 })
    }

    const { reward } = achievement.data
    const result = await unlockAchievement(uid, event, reward)

    if (result === UNLOCK_RESULT.USER_NOT_FOUND) {
      return new Response("User not found", { status: 404 })
    }

    if (result === UNLOCK_RESULT.EVENT_NOT_VERIFIED) {
      return new Response("Event does not unlock the achievement", {
        status: 422,
      })
    }

    if (result === UNLOCK_RESULT.ALREADY_UNLOCKED) {
      return Response.json({ unlocked: false })
    }

    return Response.json({ unlocked: true, reward }, { status: 201 })
  } catch (error) {
    console.error("Error in achievement event:", error)

    return new Response("Internal Server Error", { status: 500 })
  }
}

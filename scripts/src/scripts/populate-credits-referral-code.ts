import { generateReferralCode, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"
import { type UserDoc } from "@repo/schemas"

const BATCH_SIZE = 500
const DEFAULT_CREDITS = 0

const allUsers = await refs[TABLES.USERS].get()

const takenReferralCodes = new Set(
  allUsers.docs.flatMap((user) => user.data().referralCode || []),
)

const generateFreeReferralCode = () => {
  let referralCode = generateReferralCode()

  while (takenReferralCodes.has(referralCode)) {
    referralCode = generateReferralCode()
  }

  takenReferralCodes.add(referralCode)

  return referralCode
}

const updates = allUsers.docs.flatMap((user) => {
  const { credits, referralCode } = user.data()
  const update: Partial<UserDoc> = {}

  if (typeof credits !== "number") update.credits = DEFAULT_CREDITS
  if (!referralCode) update.referralCode = generateFreeReferralCode()

  const hasUpdate = Object.keys(update).length > 0

  return hasUpdate ? [{ ref: user.ref, update }] : []
})

if (updates.length === 0) {
  console.info("Every user already has credits and a referral code")
  process.exit(0)
}

console.info(`Populating ${updates.length} of ${allUsers.size} users...`)

for (let i = 0; i < updates.length; i += BATCH_SIZE) {
  const batch = db.batch()
  updates
    .slice(i, i + BATCH_SIZE)
    .forEach(({ ref, update }) => batch.update(ref, update))
  await batch.commit()
  console.info(`Updated ${Math.min(i + BATCH_SIZE, updates.length)} users`)
}

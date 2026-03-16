import { TABLES, USERS_FIELDS } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { auth, db } from "@repo/providers/firebase"

const BATCH_SIZE = 500

const deleteBatch = async (docs: FirebaseFirestore.QueryDocumentSnapshot[]) => {
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch()
    docs.slice(i, i + BATCH_SIZE).forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
  }
}

const anonymousUsers = await refs[TABLES.USERS]
  .where(USERS_FIELDS.IS_ANONYMOUS_USER, "==", true)
  .get()

if (anonymousUsers.empty) {
  console.info("No anonymous users found")
  process.exit(0)
}

console.info(`Found ${anonymousUsers.docs.length} anonymous users`)

let deletedUsers = 0
let deletedLobbies = 0
let deletedDailyChallengeResults = 0

for (const userDoc of anonymousUsers.docs) {
  const uid = userDoc.id
  const userData = userDoc.data()
  console.info(`\nProcessing user ${uid} (${userData.email})`)

  // 1. Delete dailyChallengeResults subcollection
  const dailyChallengeResults = await db
    .collection(`${TABLES.USERS}/${uid}/${TABLES.DAILY_CHALLENGE_RESULTS}`)
    .get()

  if (!dailyChallengeResults.empty) {
    console.info(`  - ${dailyChallengeResults.docs.length} daily challenge results`)
    await deleteBatch(dailyChallengeResults.docs)
    deletedDailyChallengeResults += dailyChallengeResults.docs.length
  }

  // 2. Delete lobbies where user is host + their roundAnswers subcollections
  const userLobbies = await refs[TABLES.LOBBIES].where("hostId", "==", uid).get()

  if (!userLobbies.empty) {
    console.info(`  - ${userLobbies.docs.length} lobbies as host`)
    for (const lobbyDoc of userLobbies.docs) {
      const roundAnswers = await subRefs[TABLES.ROUND_ANSWERS](lobbyDoc.id).get()
      if (!roundAnswers.empty) {
        console.info(`    - ${roundAnswers.docs.length} round answers in lobby ${lobbyDoc.id}`)
        await deleteBatch(roundAnswers.docs)
      }
      await refs[TABLES.LOBBIES].doc(lobbyDoc.id).delete()
    }
    deletedLobbies += userLobbies.docs.length
  }

  // 3. Delete user doc
  await refs[TABLES.USERS].doc(uid).delete()

  // 4. Delete Firebase Auth user
  try {
    await auth.deleteUser(uid)
    console.info(`  - Auth user deleted`)
  } catch {
    console.warn(`  - Auth user not found or already deleted`)
  }

  deletedUsers++
}

console.info(`\n--- Summary ---`)
console.info(`Users deleted: ${deletedUsers}`)
console.info(`Lobbies deleted: ${deletedLobbies}`)
console.info(`Daily challenge results deleted: ${deletedDailyChallengeResults}`)

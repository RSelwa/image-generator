import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"

const BATCH_SIZE = 500

const allUsers = await refs[TABLES.USERS].get()

console.info(allUsers.docs.length)

const usersToReset = allUsers.docs

for (let i = 0; i < usersToReset.length; i += BATCH_SIZE) {
  const batch = db.batch()
  usersToReset.slice(i, i + BATCH_SIZE).forEach((doc) => {
    batch.update(doc.ref, {
      lastStreakDate: null,
      streak: 0,
    })
  })
  await batch.commit()
}

console.info(`Reset streak for ${usersToReset.length} users`)

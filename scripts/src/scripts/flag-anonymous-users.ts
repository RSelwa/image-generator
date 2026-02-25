import { SUFFIX_ANONYMOUS_USER, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"

const allUsers = await refs[TABLES.USERS].get()

if (allUsers.empty) {
  throw new Error("No users found")
}

await Promise.all(
  allUsers.docs.map(async (user) => {
    const userData = user.data()

    const email = userData.email || ``
    const isAnonymousEmail = email.startsWith("anonymous-") && email.endsWith(SUFFIX_ANONYMOUS_USER)

    if (isAnonymousEmail) {
      console.info(`User ${user.id} is should be anonymous:`, userData.email)
    }
    await refs[TABLES.USERS].doc(user.id).update({
      isAnonymousUser: isAnonymousEmail,
    })
    console.info(`Updated user ${user.id} with isAnonymousUser flag`)
  })
)

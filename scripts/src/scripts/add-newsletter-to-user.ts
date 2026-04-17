import { TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"

const allUsers = await refs[TABLES.USERS].get()

if (allUsers.empty) {
  throw new Error("No users found")
}

const allUsersWithoutNewsletter = allUsers.docs.filter((user) => {
  const userData = user.data()

  return userData.newsletter === undefined && userData.isAnonymousUser !== true
})

if (allUsersWithoutNewsletter.length === 0) {
  console.info("All users already have a newsletter field, nothing to update")
  process.exit(0)
}

console.info(`Found ${allUsersWithoutNewsletter.length} users without newsletter field, updating them...`)

await Promise.all(
  allUsersWithoutNewsletter.map(async (user) => {
    const userData = user.data()

    if (userData.newsletter === undefined) {
      console.info(`User ${user.id} has no newsletter field, setting it to true`)

      await refs[TABLES.USERS].doc(user.id).update({
        newsletter: true,
      })
      console.info(`Updated user ${user.id} with newsletter field set to true`)
    }
  })
)

import { generateUsername, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"

const allUsers = await refs[TABLES.USERS].get()

if (allUsers.empty) {
  throw new Error("No users found")
}

const allUsersWithoutPseudo = allUsers.docs.filter((user) => {
  const userData = user.data()

  return !userData.pseudo
})

if (allUsersWithoutPseudo.length === 0) {
  console.info("All users already have a pseudo, nothing to update")
  process.exit(0)
}

console.info(`Found ${allUsersWithoutPseudo.length} users without pseudo, updating them...`)

await Promise.all(
  allUsersWithoutPseudo.map(async (user) => {
    const userData = user.data()

    if (!userData.pseudo) {
      console.info(`User ${user.id} has no pseudo, setting it to "Player"`, userData)

      const newPseudo = generateUsername()
      await refs[TABLES.USERS].doc(user.id).update({
        pseudo: newPseudo,
      })
      console.info(`Updated user ${user.id} with pseudo "Player"`)
    }
  })
)

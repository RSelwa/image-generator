import { refs } from "@repo/providers/db-refs"

const users = await refs.users.get()

console.log(users.size)

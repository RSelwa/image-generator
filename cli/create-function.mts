import { cancel, intro, isCancel, outro, select, text } from "@clack/prompts"
import { consola } from "consola"
import { TYPE_FUNCTIONS } from "./constant.mts"
import { createFirebaseTriggeredFunction } from "./create-function.firestore.mts"
import { createHttpTriggeredFunction } from "./create-function.http.mts"

const init = async () => {
  intro("😎 Welcome to the Cloud Function Creator")

  try {
    const name = await text({
      message: "Enter the name of the cloud function",
      placeholder: "my-function",
      validate: (input) => {
        if (input.length < 5) return "name must be at least 5 characters long"

        if (!/^[a-zA-Z_-]+$/.test(input)) {
          return "Function name can only contain letters, numbers, underscores, and hyphens"
        }

        return undefined
      },
    })

    if (isCancel(name)) {
      cancel("👋 Operation cancelled by user, see you soon")
      return process.exit(0)
    }

    const type = await select({
      message: "Select the type of cloud function",
      options: [
        {
          label: "http cf",
          value: TYPE_FUNCTIONS.http,
          hint: "Triggered by HTTP requests",
        },
        {
          label: "firestore cf",
          value: TYPE_FUNCTIONS.firestore,
          hint: "Triggered by Firestore events",
        },
        // {
        //   label: "pubsub cf",
        //   value: TYPE_FUNCTIONS.pubsub,
        //   hint: "Triggered by Pub/Sub events"
        // }
      ],
      initialValue: TYPE_FUNCTIONS.http,
      maxItems: 1,
    })

    if (isCancel(name) || isCancel(type)) {
      cancel("👋 Operation cancelled by user, see you soon")
      return process.exit(0)
    }

    if (type !== TYPE_FUNCTIONS.firestore && type !== TYPE_FUNCTIONS.http) {
      consola.warn(
        "Only HTTP and Firestore triggered functions are supported at the moment.",
      )
      outro("👋  Exiting the function creation process.")
      return
    }

    if (type === TYPE_FUNCTIONS.firestore)
      await createFirebaseTriggeredFunction(name)

    if (type === TYPE_FUNCTIONS.http) await createHttpTriggeredFunction(name)

    outro("🎉 Function creation completed successfully!")
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "ExitPromptError")
        return consola.info("Exiting prompts gracefully")
      return consola.error(error.message)
    }
    consola.error(error)
  }
}

await init()

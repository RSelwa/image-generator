import { cancel, confirm, isCancel, select } from "@clack/prompts"
import { consola } from "consola"
import { colors } from "consola/utils"
import { TYPE_FUNCTIONS } from "./constant.mts"
import {
  camelToDash,
  copyTemplateFiles,
  updateFirebaseConfigFile,
  updateMainPackageFile,
} from "./utils.mts"

export const HTTP_EVENTS = { onRequest: "onRequest", onCall: "onCall" } as const

export const createHttpTriggeredFunction = async (name: string) => {
  const event = await select({
    message: "Select an HTTP event",
    options: [
      {
        label: "onRequest",
        value: HTTP_EVENTS.onRequest,
        hint: "Triggered by HTTP requests",
      },
      {
        label: "onCall",
        value: HTTP_EVENTS.onCall,
        hint: "Triggered by callable HTTP requests",
      },
    ],
    initialValue: HTTP_EVENTS.onCall,
    maxItems: 1,
  })

  if (isCancel(event)) {
    cancel("👋 Operation cancelled by user, see you soon")
    return process.exit(0)
  }

  const forceDashCase = await confirm({
    message: `Should the function name be in dash case? (${camelToDash(name)})`,
    initialValue: true,
  })

  if (isCancel(forceDashCase)) {
    cancel("👋 Operation cancelled by user, see you soon")
    return process.exit(0)
  }

  await copyTemplateFiles(name, TYPE_FUNCTIONS.http, event, { forceDashCase })
  updateFirebaseConfigFile(name)
  updateMainPackageFile(name)

  consola.info(
    `Creating cloud function: ${colors.blueBright(name)} of type ${colors.greenBright(TYPE_FUNCTIONS.http)} with event ${colors.yellow(event)}`,
  )
}

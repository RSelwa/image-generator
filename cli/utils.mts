import { spinner } from "@clack/prompts"
import { consola } from "consola"
import { exec as _exec } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { readdir, readFile, unlink, writeFile } from "node:fs/promises"
import { promisify } from "node:util"
import { TYPE_FUNCTIONS } from "./constant.mts"
import type { FIRESTORE_EVENTS } from "./create-function.firestore.mts"
import type { HTTP_EVENTS } from "./create-function.http.mts"

const exec = promisify(_exec)

export const camelToDash = (value: string) => {
  return value.replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase()
}

export const dashToCamel = (value: string) => {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

export const dashToSnake = (value: string) => {
  return value.replace(/-/g, "_")
}

export const updateFirebaseConfigFile = (rawName: string) => {
  const name = camelToDash(rawName)

  const newFunction = {
    source: `functions/${name}`,
    runtime: "nodejs22",
    isolate: true,
    predeploy: [`pnpm build:${name}`],
    codebase: name,
  }

  const firebaseConfigFilePath = "firebase.json"

  const fileContent = readFileSync(firebaseConfigFilePath, "utf8")
  const firebaseConfig = JSON.parse(fileContent)
  const functionsConfig = firebaseConfig.functions || []

  // Check if the function already exists
  const functionExists = functionsConfig.some(
    (func) => func.source === newFunction.source,
  )

  if (functionExists) {
    consola.info(`Function ${rawName} already exists in firebase.json`)
    return
  }

  // Add the new function to the functions array
  functionsConfig.push(newFunction)

  // Update the firebase config object
  firebaseConfig.functions = functionsConfig

  // Write the updated config back to the file
  writeFileSync(firebaseConfigFilePath, JSON.stringify(firebaseConfig), "utf8")
  consola.info(`Function ${name} added to firebase.json`)
}

export const updateMainPackageFile = (rawName: string) => {
  const name = camelToDash(rawName)
  const mainPackage = "package.json"

  const fileContent = readFileSync(mainPackage, "utf8")
  const packageContent = JSON.parse(fileContent)
  const scripts = packageContent.scripts || {}

  // Check if the function already exists
  const scriptAlreadyExists = Object.keys(scripts).some(
    (scriptName) =>
      scriptName === `build:${name}` || scriptName === `watch:${name}`,
  )

  if (scriptAlreadyExists) {
    consola.warn(`Function ${name} already exists in package.json scripts`)

    return
  }

  // Add the new scripts for build and watch
  scripts[`build:${name}`] = `turbo run build --filter=@repo/${name}`

  // Update the package content with the new scripts
  packageContent.scripts = scripts

  // Write the updated package content back to the file
  writeFileSync(mainPackage, JSON.stringify(packageContent, null, 2), "utf8")

  consola.info(`Scripts for ${name} added to package.json`)
}

export const copyTemplateFiles = async (
  rawName: string,
  type: (typeof TYPE_FUNCTIONS)[keyof typeof TYPE_FUNCTIONS],
  event:
    | (typeof FIRESTORE_EVENTS)[keyof typeof FIRESTORE_EVENTS]
    | (typeof HTTP_EVENTS)[keyof typeof HTTP_EVENTS],
  options?: { documentPath?: string; forceDashCase?: boolean },
) => {
  const dashedName = camelToDash(rawName)
  const camelCaseName = dashToCamel(dashedName)
  const snakeCaseName = dashToSnake(dashedName)

  const templatePath = `cli/template/${type}`
  const cfDir = `functions`
  const destinationPath = `${cfDir}/${dashedName}`

  const s = spinner()

  try {
    s.start(`Copying template files for ${dashedName}...`)

    if (existsSync(destinationPath)) {
      s.stop(`Directory ${destinationPath} already exists.`)
      throw new Error(`Directory ${destinationPath} already exists.`)
    }

    await exec(`cp -R ${templatePath} ${cfDir}/${type}`)
    await exec(`mv ${cfDir}/${type} ${destinationPath}`)

    const hasFileToRename = existsSync(`${destinationPath}/src/${event}.ts`)

    if (!hasFileToRename) {
      consola.error(
        `Template file for event ${event} does not exist in ${destinationPath}/src`,
      )
      return
    }

    await exec(
      `mv ${destinationPath}/src/${event}.ts ${destinationPath}/src/index.ts`,
    )

    // GH Actions
    const ghActionFilePath = `.github/workflows/deploy-${dashedName}-function.yml`

    await exec(`mv ${destinationPath}/gh-action.yml ${ghActionFilePath}`)

    const fileContentGHAction = await readFile(ghActionFilePath, "utf8")

    const updatedContentGHAction = fileContentGHAction
      .replaceAll("{{FUNCTION_NAME}}", dashedName)
      .replaceAll("{{FUNCTION_FOLDER}}", dashedName)

    writeFileSync(ghActionFilePath, updatedContentGHAction, "utf8")

    const files = await readdir(`${destinationPath}/src`)

    const filesToKeep = ["index.ts", "index.test.ts"]

    // Remove all files in the src directory except the one we want to rename
    for (const file of files) {
      if (filesToKeep.includes(file)) continue

      const filePath = `${destinationPath}/src/${file}`

      if (existsSync(filePath)) await unlink(filePath)
    }

    const packagePath = `${destinationPath}/package.json`

    const fileContent = await readFile(packagePath, "utf8")
    const packageContent = JSON.parse(fileContent)

    packageContent.name = `@repo/${dashedName}`

    // Write the updated package content back to the file
    await writeFile(
      packagePath,
      JSON.stringify(packageContent, null, 2),
      "utf8",
    )

    const srcFiles = await readdir(`${destinationPath}/src`)

    for (const file of srcFiles) {
      const path = `${destinationPath}/src/${file}`
      const content = await readFile(path, "utf8")

      let updatedContent = content.replaceAll(
        "{{FUNCTION_NAME}}",
        options?.forceDashCase ? snakeCaseName : camelCaseName,
      )

      if (type === TYPE_FUNCTIONS.firestore && options?.documentPath) {
        updatedContent = updatedContent.replaceAll(
          "{{DOCUMENT_PATH}}",
          options.documentPath,
        )
      }
      await writeFile(path, updatedContent, "utf8")
    }

    s.stop(`Template files copied to ${destinationPath}`)

    s.start("Installing dependencies...")
    await exec(`pnpm --filter @repo/${dashedName} install`)
    s.stop(`Dependencies installed to ${destinationPath}`)
  } catch (error) {
    s.stop(`Error copying template files`)

    consola.error(`Error copying template files: ${error}`)

    throw error
  }
}

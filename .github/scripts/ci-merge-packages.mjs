const FUNCTIONS_DIRECTORY = "functions/"

const FRONT_PACKAGES = [
  "@repo/front",
  "@repo/create-user-document",
  "@repo/lobby-presence",
]

export default async ({ core }) => {
  const {
    packages: { items },
  } = JSON.parse(process.env.TURBO_JSON)
  const packages = items.map((i) => i.name)
  core.setOutput("packages", JSON.stringify(packages))

  const functions = items
    .filter((i) => i.path.startsWith(FUNCTIONS_DIRECTORY))
    .map((i) => i.path.slice(FUNCTIONS_DIRECTORY.length))
  const isCfWorkflowHit = process.env.CF_WORKFLOW_HIT === "true"
  const isCfAffected = isCfWorkflowHit || functions.length > 0
  core.setOutput("cf_affected", String(isCfAffected))
  core.setOutput("cf_functions", isCfWorkflowHit ? "" : functions.join(","))

  const isFrontAffected =
    process.env.FRONT_WORKFLOW_HIT === "true" ||
    packages.some((name) => FRONT_PACKAGES.includes(name))
  core.setOutput("front_affected", String(isFrontAffected))

  console.info("Packages:", packages)
  console.info("Cloud functions:", isCfWorkflowHit ? "all" : functions)
  console.info("front_affected:", isFrontAffected)
}

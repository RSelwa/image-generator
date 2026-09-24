import { readFile } from "node:fs/promises"

const mapping = [
  {
    key: "front",
    patterns: [
      ".github/workflows/front.yml",
      ".github/actions/deploy/",
      "ecosystem.config.cjs",
    ],
  },
  {
    key: "cf",
    patterns: [".github/workflows/deploy-cloud-functions.yml", "firebase.json"],
  },
  {
    key: "audio_extraction",
    patterns: [
      ".github/workflows/deploy-cloud-run.yml",
      ".github/actions/cloud-build/",
      "functions/audio-extraction/",
      "libs/common/",
    ],
  },
  {
    key: "video_capture",
    patterns: [
      ".github/workflows/deploy-cloud-run.yml",
      ".github/actions/cloud-build/",
      "functions/video-capture/",
      "apps/front/app/capture/",
      "libs/common/",
    ],
  },
  {
    key: "video_post_production",
    patterns: [
      ".github/workflows/deploy-cloud-run.yml",
      ".github/actions/cloud-build/",
      "functions/video-post-production/",
    ],
  },
]

const CLOUD_RUN_SERVICES = {
  audio_extraction: "audio-extraction",
  video_capture: "video-capture",
  video_post_production: "video-post-production",
}

export default async ({ core }) => {
  const content = await readFile(process.env.CHANGED_FILES, "utf8")
  const files = content.split("\n").filter(Boolean)
  console.info("Changed files:", files)

  const hits = Object.fromEntries(
    mapping.map(({ key, patterns }) => [
      key,
      files.some((f) => patterns.some((p) => f === p || f.startsWith(p))),
    ]),
  )

  for (const [key, hit] of Object.entries(hits)) {
    core.setOutput(key, String(hit))
    console.info(`${key}: ${hit}`)
  }

  const cloudRun = Object.entries(CLOUD_RUN_SERVICES)
    .filter(([key]) => hits[key])
    .map(([, service]) => service)
  core.setOutput("cloud_run", cloudRun.join(","))
}

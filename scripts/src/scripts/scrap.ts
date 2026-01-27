import { DIFFICULTIES } from "@repo/common"
import { parse } from "acorn"
import * as walk from "acorn-walk"
import { JSDOM } from "jsdom"
import z from "zod"
import { TABLES } from "../../../libs/common/src/constants/firebase.ts"
import { randomElement } from "../../../libs/common/src/utils/object.ts"
import {
  collectionGroupRefs,
  refs,
  subRefs,
} from "../../../libs/providers/dist/db-refs.js"
import { gameDocSchema } from "../../../libs/schemas/src/firestore/game.ts"
import { sphericalDocSchema } from "../../../libs/schemas/src/firestore/spherical.ts"

const scrapVariableSchema = z.object({
  game: z.string().min(1),
  id_game: z.string().min(1),
  gameSrc: z.string().min(1),
  mid_name: z.string(),
  alternate_name: z.string(),
  jacket: z.string().min(1),
  mosaics: z.array(z.array(z.string())).optional(),
})
type ScrapVariableSchema = z.infer<typeof scrapVariableSchema>

const mosaic = "mosaics"
const allowedNames = [
  "games",
  "id_games",
  "gamesSrc",
  "mid_name",
  "alternate_name",
  "jacket",
]

const getExistingDocs = async () => {
  const [sphericalSnapshot, gamesSnapshot] = await Promise.all([
    collectionGroupRefs.spherical.get(),
    refs.games.get(),
  ])

  const existingImageSource = new Set<string>()
  const existingGamesId = new Set<string>()

  for (const doc of sphericalSnapshot.docs) {
    existingImageSource.add(doc.data().image)
  }

  for (const doc of gamesSnapshot.docs) {
    existingGamesId.add(doc.id)
  }

  return { existingImageSource, existingGamesId }
}
const existing = await getExistingDocs()

export const getVariables = async () => {
  const playFile = await fetch("https://www.game-guessr.com/play.html")
  const html = await playFile.text()

  const dom = new JSDOM(html)
  const document = dom.window.document

  const scripts = document.querySelectorAll("script")

  const script = scripts[3]

  const code = (script.textContent as string)
    .trim()
    .replace(/<!--[\s\S]*?-->/g, "")

  const found: { [key: string]: string[] | string[][][] } = {}

  const ast = parse(code, {
    ecmaVersion: "latest",
    sourceType: "module",
    locations: true,
  })

  // Collect all variable declarations with their line numbers
  const declarations: {
    name: string
    line: number
    start: number
    end: number
  }[] = []

  walk.simple(ast, {
    VariableDeclarator(node) {
      if (node.id.type !== "Identifier") return

      if (allowedNames.includes(node.id.name)) {
        found[node.id.name] = JSON.parse(
          code.slice(
            node.init?.start ?? node.start,
            node.init?.end ?? node.end,
          ),
        )
      }

      if (node.loc) {
        declarations.push({
          name: node.id.name,
          line: node.loc.start.line,
          start: node.init?.start ?? node.start,
          end: node.init?.end ?? node.end,
        })
      }
    },
  })

  // Find "life" and get the variable on the previous line
  const lifeDecl = declarations.find((d) => d.name === "life")

  if (lifeDecl) {
    const prevLineDecl = declarations.find((d) => d.line === lifeDecl.line - 1)
    if (prevLineDecl) {
      const rawValue = code.slice(prevLineDecl.start, prevLineDecl.end)

      const fixedRaw = JSON.stringify(
        JSON.parse(rawValue.replace("JSON.parse('", "").replace("')", "")),
      )

      found[mosaic] = JSON.parse(fixedRaw) as string[][][]
    }
  }

  return found
}

const getScrapData = async () => {
  try {
    const vars = await getVariables()

    const games = Object.values(vars)
      .map((_, index) => {
        const scrap = scrapVariableSchema.safeParse({
          game: vars.games[index],
          id_game: vars.id_games[index],
          gameSrc: vars.gamesSrc[index],
          mid_name: vars.mid_name[index],
          alternate_name: vars.alternate_name[index],
          jacket: vars.jacket[index],
          mosaics: vars.mosaics[index] as string[][],
        })

        if (scrap.error) {
          console.error("Scrap parsing error:", scrap.error)
          return null
        }

        const { data } = scrap

        return data
      })
      .filter((g) => g !== null)

    return games
  } catch (error) {
    console.error("Error fetching variables:", error)

    return []
  }
}

const createOrUpdateDb = async (data: ScrapVariableSchema) => {
  try {
    const isGameExisting = existing.existingGamesId.has(data.id_game)
    const isImageExisting = existing.existingImageSource.has(data.gameSrc)

    const gameRef = refs.games.doc(data.id_game)

    if (!isGameExisting) {
      const doc = gameDocSchema.parse(data)

      await gameRef.set(doc)
      console.info(`✅ Created game: ${data.id_game}`)

      existing.existingGamesId.add(data.id_game)
    } else console.info(`⚠️ Game already exists for game ID: ${data.id_game}`)

    if (!isImageExisting) {
      const doc = sphericalDocSchema.parse({
        gameRef: `/${TABLES.GAMES}/${gameRef.id}`,
        gameId: gameRef.id,
        image: data.gameSrc,
        mosaics: data.mosaics?.flat(),
        difficulty: randomElement(Object.values(DIFFICULTIES)),
      })

      await subRefs.spherical(data.id_game).add(doc)

      console.info(`✅ Created spherical for game ID: ${data.id_game}`)

      existing.existingImageSource.add(data.gameSrc)
    } else console.info(`⚠️ Spherical already existed: ${data.gameSrc}`)
  } catch (error) {
    console.error("Error creating or updating DB:", error)
  }
}

const length = 1000
const iterations = Array.from({ length }).fill(0)

for (const i of iterations.keys()) {
  console.info(`🔄 Iteration ${i + 1} of ${length}`)

  const scrapped = await getScrapData()

  for (const data of scrapped) {
    await createOrUpdateDb(data)
  }
}

import { parse } from "acorn"
import * as walk from "acorn-walk"
import { JSDOM } from "jsdom"
import z from "zod"

const allowedNames = [
  "games",
  "id_games",
  "gamesSrc",
  "mid_name",
  "alternate_name",
  "jacket",
]

const getImageUrl = (image: string) => {
  return `https://www.game-guessr.com/php/image.php?image=${image}`
}

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

  const found: Record<string, string[]> = {}

  const ast = parse(code, {
    ecmaVersion: "latest",
    sourceType: "module",
  })

  walk.simple(ast, {
    VariableDeclarator(node) {
      if (
        node.id.type === "Identifier" &&
        allowedNames.includes(node.id.name)
      ) {
        found[node.id.name] = JSON.parse(
          code.slice(
            node.init?.start ?? node.start,
            node.init?.end ?? node.end,
          ),
        )
      }
    },
  })

  return found
}

const scrapVariable = z.object({
  games: z.string().min(1),
  id_games: z.string().min(1),
  gamesSrc: z.string().min(1),
  mid_name: z.string(),
  alternate_name: z.string(),
  jacket: z.string().min(1),
})

try {
  const vars = await getVariables()

  const games = vars.games

  games.forEach((game, index) => {
    const scrap = scrapVariable.safeParse({
      games: game,
      id_games: vars.id_games[index],
      gamesSrc: vars.gamesSrc[index],
      mid_name: vars.mid_name[index],
      alternate_name: vars.alternate_name[index],
      jacket: vars.jacket[index],
    })

    if (scrap.error) return

    const { data } = scrap

    console.log(data.games)
  })
} catch (error) {
  console.error("Error fetching variables:", error)

  Deno.exit(1)
}

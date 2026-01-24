import { parse } from "acorn"
import * as walk from "acorn-walk"
import { JSDOM } from "jsdom"

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

try {
  const vars = await getVariables()

  const games = vars.games

  games.forEach((game, index) => {
    console.log(`Image URL: ${getImageUrl(vars.gamesSrc[index])}`)
    console.log("---------------------------")
  })
} catch (error) {
  console.error("Error fetching variables:", error)

  Deno.exit(1)
}

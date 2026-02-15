import list from "./username-possibilities.json" with { type: "json" }

export const generateUsername = () => {
  const { adjectives, animals, colors } = list

  const color = colors[Math.floor(Math.random() * colors.length)] ?? ""
  const adjective =
    adjectives[Math.floor(Math.random() * adjectives.length)] ?? ""
  const animal = animals[Math.floor(Math.random() * animals.length)] ?? ""

  return `${adjective}-${color}-${animal}`.toLowerCase()
}

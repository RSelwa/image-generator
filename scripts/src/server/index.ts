import cors from "cors"
import express from "express"
import { createParty } from "../scripts/create-party.ts"

const app = express()

app.use(cors())

app.get("/", (req, res) => {
  res.json("Welcome to the Dinosaur API!")
})

app.get("/test-create-game", async (req, res) => {
  try {
    const game = await createParty()

    res.json({ game })
  } catch (error) {
    console.error(error)
    res.json({ error: "Failed to create game" })
  }
})

app.listen(8000)
console.info(`Server is running on http://localhost:8000`)

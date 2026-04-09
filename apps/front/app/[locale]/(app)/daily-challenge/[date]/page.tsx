import { type Metadata } from "next"
import DailyChallengeDateContent from "./daily-challenge-date-content"

export const generateMetadata = async ({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> => {
  const { date } = await params
  const formatted = new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  return {
    title: `Daily Challenge ${formatted} — Geo Gamer`,
    description: `Play the Geo Gamer daily challenge for ${formatted}. Identify 5 iconic video game scenes and compete on the global leaderboard.`,
  }
}

export default DailyChallengeDateContent

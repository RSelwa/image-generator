import { APP_BASE_URL } from "@repo/common"
import { type Metadata } from "next"
import DailyChallengeDateContent from "./daily-challenge-date-content"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ date: string, locale: string }>
}): Promise<Metadata> => {
  const { date, locale } = await params
  const formatted = new Date(date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Never include the game title (the answer) in the metadata: it would leak the
  // solution in the browser tab, search engines and link previews.
  const title = locale === "fr" ? `Défi du Jour ${formatted} — Geo Gamer` : `Daily Challenge ${formatted} — Geo Gamer`

  const description = locale === "fr" ? `Joue au défi du jour Geo Gamer du ${formatted}. Devine 5 scènes iconiques de jeux vidéo et grimpe dans le classement mondial.` : `Play the Geo Gamer daily challenge for ${formatted}. Identify 5 iconic video game scenes and compete on the global leaderboard.`

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_BASE_URL}/${locale}/daily-challenge/${date}`,
      languages: {
        en: `${APP_BASE_URL}/en/daily-challenge/${date}`,
        fr: `${APP_BASE_URL}/fr/daily-challenge/${date}`,
        "x-default": `${APP_BASE_URL}/en/daily-challenge/${date}`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default DailyChallengeDateContent

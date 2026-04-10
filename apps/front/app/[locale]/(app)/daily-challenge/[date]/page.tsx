import { APP_BASE_URL } from "@repo/common"
import { dailyChallengeDocSchema } from "@repo/schemas"
import { type Metadata } from "next"
import { API_ENDPOINTS } from "@/constants/mapping"
import DailyChallengeDateContent from "./daily-challenge-date-content"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ date: string; locale: string }>
}): Promise<Metadata> => {
  const { date, locale } = await params
  const formatted = new Date(date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  let gameTitle: string | null = null
  try {
    const res = await fetch(`${APP_BASE_URL}${API_ENDPOINTS.DAILY_CHALLENGE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
      next: { revalidate: 86400 },
    })
    const data = await res.json()
    const { data: challenge } = dailyChallengeDocSchema.safeParse(data?.dailyChallenge)
    gameTitle = challenge?.gameTitle || null
  } catch {
    // fallback to date-only metadata
  }

  const title = gameTitle
    ? locale === "fr"
      ? `Défi du Jour ${formatted} — Devine les lieux dans ${gameTitle} — Geo Gamer`
      : `Daily Challenge ${formatted} — Guess the Location in ${gameTitle} — Geo Gamer`
    : locale === "fr"
      ? `Défi du Jour ${formatted} — Geo Gamer`
      : `Daily Challenge ${formatted} — Geo Gamer`

  const description = gameTitle
    ? locale === "fr"
      ? `Joue au défi du jour Geo Gamer du ${formatted} sur ${gameTitle}. Devine les scènes iconiques et grimpe dans le classement mondial.`
      : `Play the Geo Gamer daily challenge for ${formatted} featuring ${gameTitle}. Guess the iconic scenes and compete on the global leaderboard.`
    : locale === "fr"
      ? `Joue au défi du jour Geo Gamer du ${formatted}. Devine 5 scènes iconiques de jeux vidéo et grimpe dans le classement mondial.`
      : `Play the Geo Gamer daily challenge for ${formatted}. Identify 5 iconic video game scenes and compete on the global leaderboard.`

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

import { ArrowUpRight } from "lucide-react"
import { type Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArticlesDescription, HomeArticles } from "@/components/home/home-articles"
import { CreateLobbyContainer } from "@/components/home/home-create-lobby"
import HomeFooter from "@/components/home/home-footer"
import { HomeStrips } from "@/components/home/home-strips"
import { Instagram, LogoWithIcon, MiniStrips, TikTok } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { ARTICLES, HOME_ARTICLES } from "@/constants/articles"
import { PAGES } from "@/constants/pages"
import { FOOTER_SOCIALS } from "@/constants/social"

export const metadata: Metadata = {
  title: "Geo Gamer — Guess Iconic Video Game Locations with Friends",
  description:
    "Explore 300+ scenes from iconic video game worlds and guess where you are. Play solo or challenge up to 7 friends in real-time multiplayer. Free, no download required.",
  openGraph: {
    title: "Geo Gamer — Guess Iconic Video Game Locations with Friends",
    description:
      "Explore 300+ scenes from iconic video game worlds and guess where you are. Challenge up to 7 friends in real-time multiplayer. Free to play in your browser.",
    type: "website",
    images: [{ url: "/opengraph-image.jpg" }],
  },
}

const Page = () => {
  return (
    <main className="h-full-height">
      <section className="relative h-full-height w-full">
        <CreateLobbyContainer />
        <HomeStrips />
        <article className="absolute bottom-18 w-5/6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:w-auto lg:bottom-9 lg:left-24">
          <LogoWithIcon className="lg:h-48 text-primary" />
        </article>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <article className="px-5 py-6 flex flex-col">
          <p className="mb-3 font-interference">Latest News</p>
          <h2 className="mb-6 text-4xl lg:text-6xl font-shapiro-wide">Geo Gamer</h2>
          <p className="lg:w-1/2 mb-8 font-sans opacity-60">
            Stay up to date with the latest Geo Gamer news — new scenes, multiplayer updates, and community events.
          </p>
          <div className="flex flex-col lg:flex-row gap-3 lg:w-2/3">
            <Button variant="marathon-white" className="flex-1" asChild><Link href="/blog">See all <ArrowUpRight className="size-6" /></Link></Button>
          </div>
        </article>
        <article className="bg-primary text-primary-foreground flex flex-col justify-between">
          <div className="p-5">
            <MiniStrips className="h-5 mb-7" />
            <h2 className="font-shapiro-wide lg:mb-6 lg:text-4xl">Play now</h2>
            <p className="lg:w-1/2">
              The GeoGuessr for video games. Free to play in your browser — no download required. Jump into a solo game or invite up to 7 friends for a multiplayer session.
            </p>
          </div>
          <div className="border-t border-background grid grid-cols-2">
            <Link href={FOOTER_SOCIALS[0].href} target="_blank" className="p-5 hover:text-primary hover:bg-primary-foreground border-r border-background flex items-center justify-center gap-2">
              <TikTok className="size-6" />
              {FOOTER_SOCIALS[0].label}
            </Link>
            <Link href={FOOTER_SOCIALS[1].href} target="_blank" className="p-5  hover:text-primary hover:bg-primary-foreground flex items-center justify-center gap-2">
              <Instagram className="size-6" />

              {FOOTER_SOCIALS[1].label}
            </Link>
          </div>
        </article>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-4">
        {HOME_ARTICLES.map((article, index) => (
          <HomeArticles key={article.title} {...article} className={index === 2 ? "lg:col-start-4" : ""} />
        ))}
      </section>
      <section className="px-5 py-16 lg:py-32">
        <p className="font-interference uppercase mb-3">
          The GeoGuessr for gamers
        </p>
        <h1 className="font-shapiro-wide font-bold text-5xl lg:text-9xl">
          300+ SCENES. 8 PLAYERS. ENDLESS ROUNDS.
        </h1>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-between lg:w-1/2">
          <article className="p-5 font-mono space-y-4 uppercase">
            <p>
              Drop into iconic locations from your favorite video game universes and guess exactly where you are. The closer your guess, the more points you earn — but your friends are racing against you.
            </p>
            <p>
              Create a lobby in seconds, share your code, and compete in real-time with up to 8 players. Every round is a fresh challenge.
            </p>
          </article>
          <ArticlesDescription
            subTitle="Challenge up to 7 friends"
            title="MULTIPLAYER"
            description="Invite up to 7 friends and battle it out in real-time. Create a lobby in seconds, share the code, and see who truly knows their video game geography best."
            link={PAGES.BLOG("multiplayer")}
            variant="white"
          />
        </div>
        <Image src={ARTICLES.MULTIPLAYER.imageLink} alt="Geo Gamer multiplayer session" height={650} width={650} className="size-full" />
      </section>
      <section className="relative flex flex-col">
        <Image src={ARTICLES.SPECIAL_ROUNDS.imageLink} alt="Special Rounds feature" height={650} width={650} className="w-full lg:h-full-height object-cover" />
        <ArticlesDescription
          subTitle="Customize every game"
          title="SPECIAL ROUNDS"
          description="Don't leave it to chance. Special Rounds lets you hand-pick the scene for each round, so you can build themed challenges, focus on specific games, or set the difficulty exactly how you want it."
          link={PAGES.BLOG("special-rounds")}
          variant="white"
          className="lg:absolute bottom-0 right-0 lg:w-1/3"
        />
      </section>
      <HomeFooter />
    </main>
  )
}

export default Page

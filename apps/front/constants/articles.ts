import { BLOG_POSTS } from "@/constants/blog"
import { PAGES } from "@/constants/pages"

export const ARTICLES = {
  MULTIPLAYER: {
    title: "Multiplayer up to 8 players",
    description: "Challenge your friends in real-time geo-guessing battles across video game universes",
    imageLink: "/articles/shoot.jpg",
    href: PAGES.BLOG(BLOG_POSTS.MULTIPLAYER.slug),
  },
  SCENES: {
    title: "300+ scenes available",
    description: "Hundreds of iconic environments from your favorite video games, ready to explore",
    imageLink: "/articles/shoot.jpg",
    href: PAGES.BLOG(BLOG_POSTS.SCENES.slug),
  },
  SPECIAL_ROUNDS: {
    title: "Special Rounds",
    description: "Hand-pick scenes for each round and craft your own custom challenges",
    imageLink: "/articles/shoot.jpg",
    href: PAGES.BLOG(BLOG_POSTS.SPECIAL_ROUNDS.slug),
  },
} as const

export const HOME_ARTICLES = [
  ARTICLES.MULTIPLAYER,
  ARTICLES.SCENES,
  ARTICLES.SPECIAL_ROUNDS,
]

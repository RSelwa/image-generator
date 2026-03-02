export type SeedCategory = {
  id: string
  seedId: string
  subTitle: string
  title: string
  description: string
  imageLink: string
}

export const SEED_CATEGORIES = {
  RETRO: {
    id: "retro",
    seedId: "",
    subTitle: "NES, SNES, PS1 & more",
    title: "RETRO GAMING",
    description: "Travel back to the pixel-perfect worlds of classic gaming. Recognize iconic scenes from retro masterpieces — the games that started it all.",
    imageLink: "/seeds/retro.jpg",
  },
  MINECRAFT: {
    id: "minecraft",
    seedId: "",
    subTitle: "Survival, Creative & more",
    title: "MINECRAFT",
    description: "From hand-built survival bases to sprawling creative worlds — guess the exact biome and location across the most iconic Minecraft scenes ever captured.",
    imageLink: "/seeds/minecraft.jpg",
  },
  TWO_D: {
    id: "2d",
    seedId: "",
    subTitle: "Platformers & side-scrollers",
    title: "2D GAMES",
    description: "Side-scrollers, metroidvanias, and pixel platformers. Identify scenes from the flattest — and finest — games ever made.",
    imageLink: "/seeds/2d.jpg",
  },
  OPEN_WORLD: {
    id: "open-world",
    seedId: "",
    subTitle: "GTA, Zelda, RDR2 & more",
    title: "OPEN WORLD",
    description: "Vast landscapes, living cities, endless exploration. Test your knowledge of the biggest and most iconic open worlds in gaming history.",
    imageLink: "/seeds/open-world.jpg",
  },
  HORROR: {
    id: "horror",
    seedId: "",
    subTitle: "Resident Evil, Silent Hill & more",
    title: "HORROR",
    description: "Dimly lit corridors, abandoned towns, and unsettling environments. Recognize the most terrifying locations from the scariest games ever made — if you dare.",
    imageLink: "/seeds/horror.jpg",
  },
  FPS: {
    id: "fps",
    seedId: "",
    subTitle: "CS2, Halo, CoD & more",
    title: "FIRST PERSON",
    description: "Maps, arenas, and battlegrounds from the most competitive shooters ever made. Spot the callout, name the map.",
    imageLink: "/seeds/fps.jpg",
  },
} as const

export const HOME_SEED_CATEGORIES = [
  SEED_CATEGORIES.RETRO,
  SEED_CATEGORIES.MINECRAFT,
  SEED_CATEGORIES.TWO_D,
  SEED_CATEGORIES.OPEN_WORLD,
]

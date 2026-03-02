export type BlogSection = {
  heading: string
  paragraphs: string[]
  items?: Array<{ label: string, text: string }>
}

export type BlogPost = {
  slug: string
  title: string
  metaDescription: string
  publishedAt: string
  readingTime: number
  sections: BlogSection[]
}

export const BLOG_POSTS = {
  MULTIPLAYER: {
    slug: "multiplayer",
    title: "Play with Up to 8 Players: Geo Gamer's Multiplayer Mode",
    metaDescription:
      "Discover how Geo Gamer's real-time multiplayer works. Create a lobby in seconds, invite up to 7 friends, and compete to identify iconic video game scenes faster and more accurately than anyone else.",
    publishedAt: "March 1, 2026",
    readingTime: 4,
    sections: [
      {
        heading: "What is Geo Gamer's Multiplayer Mode?",
        paragraphs: [
          "Geo Gamer brings the GeoGuessr formula to video game worlds — and multiplayer makes it a party. Up to 8 players compete simultaneously, each dropped into the same scene and tasked with guessing its location on the map as fast and accurately as possible.",
          "Whether you're a hardcore gamer who's memorized every corner of Dark Souls or a casual player who grew up on Mario, multiplayer is where the real rivalries are born. Every session is different, and every round is a chance to prove your gaming knowledge is second to none.",
        ],
      },
      {
        heading: "How to Start a Multiplayer Game",
        paragraphs: [
          "Creating a multiplayer session takes seconds. Hit the Create Lobby button on the home screen and you'll receive a shareable code. Send that code to up to 7 friends — they can join directly from the home page without needing an account.",
          "Once all players are in the lobby, the host configures the game: number of rounds, time limit per round, and whether to use Standard or Special Rounds mode. Hit start and everyone is dropped into the first scene at the same moment.",
        ],
      },
      {
        heading: "How Scoring Works in Multiplayer",
        paragraphs: [
          "Each round, all players see the same scene at the same time. You place your guess on the map — the closer to the actual location, the more points you earn. Speed also plays a role: faster correct guesses award bonus points.",
          "After each round, a live leaderboard shows everyone's scores so the competition stays intense from the first round to the last. The player with the most points after all rounds wins.",
        ],
      },
      {
        heading: "Tips for Winning Multiplayer",
        paragraphs: [
          "Look for visual clues unique to specific games: architectural details, lighting style, UI elements left on screen, distinctive vegetation, or the art style of the sky. Every game has a signature look once you train your eye.",
          "Speed matters, but accuracy matters more. A close guess in 20 seconds beats a distant one in 5. Stay calm, scan the scene methodically, and commit to your best guess before the timer runs out.",
          "If you're playing with friends of similar skill, use Special Rounds to focus on games you know well — home-field advantage is a real strategy.",
        ],
      },
    ],
  },
  SCENES: {
    slug: "explore-scenes",
    title: "300+ Iconic Video Game Scenes to Discover in Geo Gamer",
    metaDescription:
      "Geo Gamer features over 300 scenes from iconic video games across all genres. Explore familiar environments, test your knowledge, and discover new games through their most recognizable locations.",
    publishedAt: "March 1, 2026",
    readingTime: 4,
    sections: [
      {
        heading: "A Library Built for Gamers",
        paragraphs: [
          "The heart of Geo Gamer is its scene library — a carefully curated collection of over 300 locations drawn from iconic video games across all genres and eras. From sun-baked open-world deserts to neon-lit cyberpunk alleyways, every scene is chosen for its visual distinctiveness and recognizability.",
          "The goal isn't just to test what you know — it's to take you back to those places you spent dozens of hours exploring, and occasionally to introduce you to a world you've never seen before.",
        ],
      },
      {
        heading: "What Kinds of Scenes Are Included?",
        paragraphs: [
          "The library spans a wide range of titles: first-person shooters, open-world RPGs, platformers, racing games, horror titles, and everything in between. No single genre dominates — the selection is deliberately broad to reward players with diverse gaming histories.",
          "Scenes vary in difficulty. Some are instantly recognizable landmarks that any player of that game would spot in seconds. Others require you to analyze subtle environmental clues: the font on a sign, the art style of the sky, the shape of the terrain, or the specific color palette a studio is known for.",
        ],
      },
      {
        heading: "New Scenes Added Regularly",
        paragraphs: [
          "The library is not static. New games and new locations are added on a rolling basis, keeping the game fresh whether you're a returning champion chasing a perfect score or a newcomer still learning the ropes.",
          "Want to see a scene from a game you love? Use the in-game suggestion feature to submit it for review. Community suggestions have already shaped a large part of the current library.",
        ],
      },
      {
        heading: "How to See All 300+ Scenes",
        paragraphs: [
          "In standard mode, each game pulls from a randomized selection of scenes — so even veteran players will encounter locations they've never seen before. The more you play, the more of the library you'll cover.",
          "The Special Rounds feature gives you direct access: browse the full scene catalog and hand-pick exactly which locations appear in each round. It's the best way to intentionally explore the entire library or to focus on mastering a specific game.",
        ],
      },
    ],
  },
  SPECIAL_ROUNDS: {
    slug: "special-rounds",
    title: "Special Rounds: Build Your Own Geo Gamer Challenge",
    metaDescription:
      "Special Rounds in Geo Gamer lets you hand-pick the scene for each round. Create themed challenges, focus on specific games, save configurations as seeds, and share them with friends.",
    publishedAt: "March 1, 2026",
    readingTime: 4,
    sections: [
      {
        heading: "What Are Special Rounds?",
        paragraphs: [
          "By default, Geo Gamer selects scenes at random from its 300+ library. Special Rounds flips that: you choose the specific scene that appears in each round, giving you full control over the structure and difficulty of every game.",
          "This makes it possible to build fully custom sessions — a single-franchise challenge, a difficulty-escalating gauntlet, or a hand-crafted quiz designed specifically to stump your friends.",
        ],
      },
      {
        heading: "How to Use Special Rounds",
        paragraphs: [
          "When creating a lobby or starting a solo session, select the Special Rounds option before launching. You'll be taken to the scene browser where you can pick each round's location from the full catalog.",
          "Choose as many rounds as you like and arrange them in any order. Once your configuration is set, start the game — every player will face exactly the scenes you selected, in the order you chose.",
        ],
      },
      {
        heading: "Ideas for Custom Challenges",
        paragraphs: [
          "Not sure where to start? Here are a few formats that work especially well:",
        ],
        items: [
          {
            label: "Franchise marathon:",
            text: "Pick 5–10 scenes all from the same game and see if your friends can pinpoint the exact location within that world.",
          },
          {
            label: "Difficulty escalation:",
            text: "Start with unmistakable iconic scenes and gradually move to obscure corners of lesser-known games. A natural warm-up that gets brutal by the end.",
          },
          {
            label: "Blind challenge:",
            text: "Let a friend build the rounds without telling you which games are included. Pure guessing, no meta-knowledge.",
          },
          {
            label: "Era challenge:",
            text: "Limit your selection to games from a specific decade and test who really remembers the games of their childhood.",
          },
        ],
      },
      {
        heading: "Special Rounds and Seeds",
        paragraphs: [
          "Any Special Rounds configuration can be saved as a seed — a shareable code that recreates the exact same round sequence. Share your seed with friends so they can play the identical challenge independently and compare scores.",
          "Seeds are perfect for community events or recurring competitions: set up a weekly challenge with a fixed seed and let everyone compete on equal footing, no matter when they play.",
        ],
      },
    ],
  },
}

export const BLOG_POST_BY_SLUG = (slug: string): BlogPost | undefined => Object.values(BLOG_POSTS).find((post) => post.slug === slug
)

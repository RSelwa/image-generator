import { type Meta, type StoryObj } from "@storybook/nextjs-vite"
import { CARD_RARITY } from "@repo/common"
import { NextIntlClientProvider } from "next-intl"
import { fn } from "storybook/test"
import { PackReveal } from "@/components/tcg/pack-reveal"
import messages from "@/messages/en.json"

const RARITIES = [
  CARD_RARITY.COMMON,
  CARD_RARITY.COMMON,
  CARD_RARITY.UNCOMMON,
  CARD_RARITY.COMMON,
  CARD_RARITY.LEGENDARY,
]

const CARDS = RARITIES.map((rarity, index) => ({
  cardId: `card-${index}`,
  gameId: "pokemon-red",
  name: `Map ${index + 1}`,
  imageUrl: null,
  rarity,
  number: index + 1,
  isNew: index % 2 === 0,
}))

const meta = {
  title: "TCG/PackReveal",
  component: PackReveal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    cards: CARDS,
    canOpenAnother: true,
    onOpenAnother: fn(),
    onBack: fn(),
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
        <div className="w-[56rem]">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof PackReveal>

export default meta
type Story = StoryObj<typeof meta>

export const Pile: Story = {}

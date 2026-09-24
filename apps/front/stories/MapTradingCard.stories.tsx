import { type Meta, type StoryObj } from "@storybook/nextjs-vite"
import { CARD_RARITY } from "@repo/common"
import { NextIntlClientProvider } from "next-intl"
import { MapTradingCard } from "@/components/cards/map-trading-card"
import messages from "@/messages/en.json"

const meta = {
  title: "Cards/MapTradingCard",
  component: MapTradingCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    mapId: "kanto",
    name: "Kanto",
    imageUrl: null,
    rarity: CARD_RARITY.COMMON,
    number: 42,
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
        <div className="w-60">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof MapTradingCard>

export default meta
type Story = StoryObj<typeof meta>

export const Common: Story = {}

export const Uncommon: Story = {
  args: { rarity: CARD_RARITY.UNCOMMON },
}

export const Rare: Story = {
  args: { rarity: CARD_RARITY.RARE },
}

export const UltraRare: Story = {
  args: { rarity: CARD_RARITY.ULTRA_RARE },
}

export const Legendary: Story = {
  args: { rarity: CARD_RARITY.LEGENDARY },
}

export const WithGame: Story = {
  args: { rarity: CARD_RARITY.RARE, gameTitle: "Pokémon Red" },
}

export const Duplicate: Story = {
  args: { rarity: CARD_RARITY.LEGENDARY, count: 3 },
}

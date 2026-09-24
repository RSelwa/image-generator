import { type Meta, type StoryObj } from "@storybook/nextjs-vite"
import { PACK_REFILL_MS, PACKS_MAX } from "@repo/common"
import { NextIntlClientProvider } from "next-intl"
import { fn } from "storybook/test"
import { PackCounter } from "@/components/tcg/pack-counter"
import messages from "@/messages/en.json"

const THREE_MINUTES_MS = 3 * 60_000
const FIVE_SECONDS_MS = 5_000

const meta = {
  title: "TCG/PackCounter",
  component: PackCounter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    packsStored: PACKS_MAX,
    refillAnchorMs: null,
    isOpening: false,
    onOpen: fn(),
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof PackCounter>

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = {}

export const Partial: Story = {
  args: {
    packsStored: 7,
    refillAnchorMs: Date.now() - THREE_MINUTES_MS,
  },
}

export const Empty: Story = {
  args: {
    packsStored: 0,
    refillAnchorMs: Date.now() - THREE_MINUTES_MS,
  },
}

export const AboutToRefill: Story = {
  args: {
    packsStored: 0,
    refillAnchorMs: Date.now() - PACK_REFILL_MS + FIVE_SECONDS_MS,
  },
}

export const Opening: Story = {
  args: { packsStored: 7, isOpening: true },
}

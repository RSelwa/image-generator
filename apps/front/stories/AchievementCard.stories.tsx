import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ACHIEVEMENT_DIFFICULTY } from "@repo/common"
import { Timestamp } from "firebase/firestore"
import { NextIntlClientProvider } from "next-intl"
import { AchievementCard } from "@/components/cards/achievement-card"
import messages from "@/messages/en.json"

const ACHIEVEMENT = {
  name: "New identity",
  description: "Change your username",
  reward: 50,
  difficulty: ACHIEVEMENT_DIFFICULTY.EASY,
}

const UNLOCKED = {
  key: "change_username",
  achievedAt: Timestamp.fromDate(new Date("2026-09-20T10:00:00Z")),
  reward: 40,
}

const meta = {
  title: "Cards/AchievementCard",
  component: AchievementCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
        <div className="w-96">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof AchievementCard>

export default meta
type Story = StoryObj<typeof meta>

export const Locked: Story = {
  args: {
    achievement: ACHIEVEMENT,
  },
}

export const Unlocked: Story = {
  args: {
    achievement: ACHIEVEMENT,
    unlocked: UNLOCKED,
  },
}

export const WithGoal: Story = {
  args: {
    achievement: {
      ...ACHIEVEMENT,
      name: "Regular",
      description: "Finish 10 games",
      goalToAchieve: 10,
    },
  },
}

export const WithoutDifficulty: Story = {
  args: {
    achievement: { ...ACHIEVEMENT, difficulty: undefined },
  },
}

export const AllDifficulties: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4">
      {Object.values(ACHIEVEMENT_DIFFICULTY).map((difficulty) => (
        <AchievementCard
          key={difficulty}
          achievement={{ ...ACHIEVEMENT, difficulty }}
        />
      ))}
      {Object.values(ACHIEVEMENT_DIFFICULTY).map((difficulty) => (
        <AchievementCard
          key={`${difficulty}-unlocked`}
          achievement={{ ...ACHIEVEMENT, difficulty }}
          unlocked={UNLOCKED}
        />
      ))}
    </div>
  ),
}

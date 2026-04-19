import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import DailyChallengePub from "@/components/modals/daily-challenge-pub"

const meta = {
    title: "Modals/Pub",
    parameters: {
        layout: "centered",
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>


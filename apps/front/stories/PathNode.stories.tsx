import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PathNodeVisual } from "@/components/daily-challenge/node"
import { DAILY_CHALLENGES_VARIANTS } from "@/constants/daily-challenges"

const meta = {
  title: "DailyChallenge/PathNode",
  component: PathNodeVisual,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: Object.values(DAILY_CHALLENGES_VARIANTS),
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof PathNodeVisual>

export default meta
type Story = StoryObj<typeof meta>

export const Today: Story = {
  args: {
    variant: DAILY_CHALLENGES_VARIANTS.TODAY,
    date: "2026-03-11",
  },
}

export const Completed: Story = {
  args: {
    variant: DAILY_CHALLENGES_VARIANTS.COMPLETED,
    date: "2026-03-10",
  },
}

export const CompletedToday: Story = {
  args: {
    variant: DAILY_CHALLENGES_VARIANTS.COMPLETED_TODAY,
    date: "2026-03-10",
  },
}

export const Available: Story = {
  args: {
    variant: DAILY_CHALLENGES_VARIANTS.AVAILABLE,
    date: "2026-03-09",
  },
}

export const Future: Story = {
  args: {
    variant: DAILY_CHALLENGES_VARIANTS.FUTURE,
    date: "2026-03-12",
    disabled: true,
  },
}

export const Empty: Story = {
  args: {
    variant: DAILY_CHALLENGES_VARIANTS.EMPTY,
    date: "2026-03-05",
  },
}

export const Loading: Story = {
  args: {
    variant: DAILY_CHALLENGES_VARIANTS.LOADING,
    date: "2026-03-08",
  },
}

export const AllVariants: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-16 p-8">
      {Object.entries(DAILY_CHALLENGES_VARIANTS).map(([key, variant]) => (
        <div key={key} className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">{key}</span>
          <PathNodeVisual
            variant={variant}
            date="2026-03-11"
            disabled={variant === DAILY_CHALLENGES_VARIANTS.FUTURE}
          />
        </div>
      ))}
    </div>
  ),
}

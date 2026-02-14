import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Badge } from "@/components/ui/badge"

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "blur",
        "secondary",
        "destructive",
        "outline",
        "ghost",
        "link",
        "green",
        "red",
        "light-grey",
        "neutral",
        "orange",
      ],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: "default",
    children: "Badge",
  },
}

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
}

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
}

export const LinkVariant: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
}

export const Green: Story = {
  args: {
    variant: "green",
    children: "Success",
  },
}

export const Red: Story = {
  args: {
    variant: "red",
    children: "Error",
  },
}

export const Orange: Story = {
  args: {
    variant: "orange",
    children: "Warning",
  },
}

export const Neutral: Story = {
  args: {
    variant: "neutral",
    children: "Neutral",
  },
}

export const Blur: Story = {
  args: {
    variant: "blur",
    children: "Blur",
  },
}

export const LightGrey: Story = {
  args: {
    variant: "light-grey",
    children: "Light Grey",
  },
}

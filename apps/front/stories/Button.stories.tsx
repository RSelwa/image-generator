import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link","marathon", "marathon-white", "marathon-outline","marathon-link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    disabled: { control: "boolean" },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: "default",
    children: "Button",
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
}

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
}

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
}

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
}

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
}

export const ExtraSmall: Story = {
  args: {
    size: "xs",
    children: "Extra Small",
  },
}

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  },
}

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Mail />
      Send Email
    </Button>
  ),
  args: {
    variant: "default",
  },
}

export const IconOnly: Story = {
  render: (args) => (
    <Button {...args}>
      <Mail />
    </Button>
  ),
  args: {
    variant: "outline",
    size: "icon",
  },
}

export const IconSmall: Story = {
  render: (args) => (
    <Button {...args}>
      <Mail />
    </Button>
  ),
  args: {
    variant: "outline",
    size: "icon-sm",
  },
}

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
}

export const Marathon: Story = {
  args: {
    variant: "marathon",
    children: "Marathon",
  },
}

export const MarathonWhite: Story = {
  args: {
    variant: "marathon-white",
    children: "Marathon White",
  },
}

export const MarathonOutline: Story = {
  args: {
    variant: "marathon-outline",
    children: "Marathon Outline",
  },
}

export const MarathonLink: Story = {
  args: {
    variant: "marathon-link",
    children: "Marathon Link",
  },
}
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const meta = {
  title: "UI/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
    },
    disabled: { control: "boolean" },
    checked: { control: "boolean" },
  },
  args: {
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: "default",
  },
}

export const Small: Story = {
  args: {
    size: "sm",
  },
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
}

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" {...args} />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
  args: {
    size: "default",
  },
}

export const SmallWithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="notifications" {...args} />
      <Label htmlFor="notifications">Enable notifications</Label>
    </div>
  ),
  args: {
    size: "sm",
  },
}

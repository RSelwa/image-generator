import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const meta = {
  title: "UI/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Email address",
  },
}

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" className="w-64" />
    </div>
  ),
}

export const DisabledState: Story = {
  render: () => (
    <div className="group flex flex-col gap-2" data-disabled="true">
      <Label>Disabled label</Label>
      <Input disabled placeholder="Disabled" className="w-64" />
    </div>
  ),
}

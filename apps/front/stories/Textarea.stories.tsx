import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Textarea } from "@/components/ui/textarea"

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: "Type your message here...",
    className: "w-80",
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: "This is some pre-filled content in the textarea that demonstrates how it looks with text.",
    className: "w-80",
  },
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true,
    className: "w-80",
  },
}

export const Invalid: Story = {
  args: {
    placeholder: "Required field",
    "aria-invalid": true,
    className: "w-80",
  },
}

export const WithRows: Story = {
  args: {
    placeholder: "Enter a long description...",
    rows: 6,
    className: "w-80",
  },
}

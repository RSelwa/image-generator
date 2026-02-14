import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "@/components/ui/input"

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url", "file"],
    },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Enter text...",
    className: "w-64",
  },
}

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "you@example.com",
    className: "w-64",
  },
}

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
    className: "w-64",
  },
}

export const Number: Story = {
  args: {
    type: "number",
    placeholder: "0",
    className: "w-64",
  },
}

export const Search: Story = {
  args: {
    type: "search",
    placeholder: "Search...",
    className: "w-64",
  },
}

export const File: Story = {
  args: {
    type: "file",
    className: "w-64",
  },
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
    className: "w-64",
  },
}

export const Invalid: Story = {
  args: {
    placeholder: "Invalid input",
    "aria-invalid": true,
    defaultValue: "bad value",
    className: "w-64",
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: "Hello World",
    className: "w-64",
  },
}

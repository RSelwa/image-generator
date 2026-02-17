import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"

const meta = {
  title: "UI/Sonner",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <>
      <Toaster />
      <Button onClick={() => toast("This is a default toast")}>
        Show Toast
      </Button>
    </>
  ),
}

export const Success: Story = {
  render: () => (
    <>
      <Toaster />
      <Button onClick={() => toast.success("Action completed successfully!")}>
        Show Success
      </Button>
    </>
  ),
}

export const Error: Story = {
  render: () => (
    <>
      <Toaster />
      <Button onClick={() => toast.error("Something went wrong!")}>
        Show Error
      </Button>
    </>
  ),
}

export const Warning: Story = {
  render: () => (
    <>
      <Toaster />
      <Button onClick={() => toast.warning("Please check your input")}>
        Show Warning
      </Button>
    </>
  ),
}

export const Info: Story = {
  render: () => (
    <>
      <Toaster />
      <Button onClick={() => toast.info("Here is some information")}>
        Show Info
      </Button>
    </>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast("Event created", {
            description: "Monday, January 3rd at 6:00pm",
          })
        }
      >
        With Description
      </Button>
    </>
  ),
}

import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"
import { ImageDropzone } from "@/components/ui/image-dropzone"

const meta = {
  title: "UI/ImageDropzone",
  component: ImageDropzone,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onFileSelect: fn(() => Promise.resolve()),
    onRemove: fn(),
  },
} satisfies Meta<typeof ImageDropzone>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    imageUrl: null,
  },
  render: (args) => (
    <div className="w-64">
      <ImageDropzone {...args} />
    </div>
  ),
}

export const WithImage: Story = {
  args: {
    imageUrl: "https://picsum.photos/400/400",
    alt: "Sample image",
  },
  render: (args) => (
    <div className="w-64">
      <ImageDropzone {...args} />
    </div>
  ),
}

export const Uploading: Story = {
  args: {
    imageUrl: null,
    isUploading: true,
  },
  render: (args) => (
    <div className="w-64">
      <ImageDropzone {...args} />
    </div>
  ),
}

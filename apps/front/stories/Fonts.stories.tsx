import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "@/components/ui/input"

const DEFAULT_TEXT = "The quick brown fox jumps over the lazy dog"

const FONTS = [
  { name: "Fraktion", className: "font-fraktion", variable: "--font-fraktion" },
  { name: "Fraktion Mono", className: "font-fraktion-mono", variable: "--font-fraktion-mono" },
  { name: "Interference", className: "font-interference", variable: "--font-interference" },
  { name: "Shapiro", className: "font-shapiro", variable: "--font-shapiro" },
] as const

const FontCard = ({ name, className, variable }: { name: string; className: string; variable: string }) => {
  const [text, setText] = useState(DEFAULT_TEXT)

  return (
    <div className="flex flex-col gap-3 p-6 border border-border rounded-lg w-full max-w-2xl">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">{name}</span>
        <div className="flex gap-3">
          <code className="text-xs text-muted-foreground">{variable}</code>
          <code className="text-xs text-muted-foreground">.{className}</code>
        </div>
      </div>
      <p className={`text-4xl leading-tight ${className}`}>{text || DEFAULT_TEXT}</p>
      <p className={`text-base text-muted-foreground ${className}`}>
        ABCDEFGHIJKLMNOPQRSTUVWXYZ
      </p>
      <p className={`text-base text-muted-foreground ${className}`}>
        abcdefghijklmnopqrstuvwxyz 0123456789
      </p>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Type to preview ${name}...`}
      />
    </div>
  )
}

const AllFontsPreview = () => (
  <div className="flex flex-col gap-6 p-8">
    {FONTS.map((font) => (
      <FontCard key={font.name} {...font} />
    ))}
  </div>
)

const meta = {
  title: "Design/Fonts",
  component: AllFontsPreview,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AllFontsPreview>

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}

export const Fraktion: Story = {
  render: () => <FontCard name="Fraktion" className="font-fraktion" variable="--font-fraktion" />,
  parameters: { layout: "centered" },
}

export const FraktionMono: Story = {
  render: () => <FontCard name="Fraktion Mono" className="font-fraktion-mono" variable="--font-fraktion-mono" />,
  parameters: { layout: "centered" },
}

export const Interference: Story = {
  render: () => <FontCard name="Interference" className="font-interference" variable="--font-interference" />,
  parameters: { layout: "centered" },
}

export const Shapiro: Story = {
  render: () => <FontCard name="Shapiro" className="font-shapiro" variable="--font-shapiro" />,
  parameters: { layout: "centered" },
}

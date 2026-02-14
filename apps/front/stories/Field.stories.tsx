import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"

const meta = {
  title: "UI/Field",
  component: Field,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal", "responsive"],
    },
  },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: (args) => (
    <Field {...args} className="w-80">
      <FieldLabel>Email</FieldLabel>
      <FieldContent>
        <Input type="email" placeholder="you@example.com" />
        <FieldDescription>Enter your email address.</FieldDescription>
      </FieldContent>
    </Field>
  ),
  args: {
    orientation: "vertical",
  },
}

export const Horizontal: Story = {
  render: (args) => (
    <Field {...args} className="w-96">
      <FieldLabel>Username</FieldLabel>
      <FieldContent>
        <Input placeholder="johndoe" />
      </FieldContent>
    </Field>
  ),
  args: {
    orientation: "horizontal",
  },
}

export const Responsive: Story = {
  render: (args) => (
    <FieldGroup className="w-96">
      <Field {...args}>
        <FieldLabel>First name</FieldLabel>
        <FieldContent>
          <Input placeholder="John" />
        </FieldContent>
      </Field>
      <Field {...args}>
        <FieldLabel>Last name</FieldLabel>
        <FieldContent>
          <Input placeholder="Doe" />
        </FieldContent>
      </Field>
    </FieldGroup>
  ),
  args: {
    orientation: "responsive",
  },
}

export const WithError: Story = {
  render: (args) => (
    <Field {...args} className="w-80" data-invalid="true">
      <FieldLabel>Password</FieldLabel>
      <FieldContent>
        <Input type="password" aria-invalid="true" />
        <FieldError>Password must be at least 8 characters.</FieldError>
      </FieldContent>
    </Field>
  ),
  args: {
    orientation: "vertical",
  },
}

export const WithMultipleErrors: Story = {
  render: (args) => (
    <Field {...args} className="w-80" data-invalid="true">
      <FieldLabel>Password</FieldLabel>
      <FieldContent>
        <Input type="password" aria-invalid="true" />
        <FieldError
          errors={[
            { message: "Must be at least 8 characters" },
            { message: "Must contain a number" },
            { message: "Must contain a special character" },
          ]}
        />
      </FieldContent>
    </Field>
  ),
  args: {
    orientation: "vertical",
  },
}

export const FieldSetExample: Story = {
  render: () => (
    <FieldSet className="w-96">
      <FieldLegend>Account Details</FieldLegend>
      <FieldGroup>
        <Field orientation="vertical">
          <FieldLabel>Email</FieldLabel>
          <FieldContent>
            <Input type="email" placeholder="you@example.com" />
          </FieldContent>
        </Field>
        <FieldSeparator />
        <Field orientation="vertical">
          <FieldLabel>Password</FieldLabel>
          <FieldContent>
            <Input type="password" placeholder="Enter password" />
            <FieldDescription>
              Must be at least 8 characters.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
}

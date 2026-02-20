import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxInput,
  ComboboxSeparator,
  useComboboxAnchor,
} from "@/components/ui/combobox"

const meta = {
  title: "UI/Combobox",
  component: Combobox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

const fruits = ["Apple", "Banana", "Cherry", "Grape", "Orange", "Peach", "Pear", "Plum"]

export const Default: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Search fruit..." className="w-64" />
      <ComboboxContent>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxList>
          {fruits.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit}>
              {fruit}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
}

export const WithClear: Story = {
  render: () => (
    <Combobox defaultValue="Apple">
      <ComboboxInput placeholder="Search fruit..." className="w-64" showClear />
      <ComboboxContent>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxList>
          {fruits.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit}>
              {fruit}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
}

export const WithGroups: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Search food..." className="w-64" />
      <ComboboxContent>
        <ComboboxEmpty>No food found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxLabel>Fruits</ComboboxLabel>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
            <ComboboxItem value="cherry">Cherry</ComboboxItem>
          </ComboboxGroup>
          <ComboboxSeparator />
          <ComboboxGroup>
            <ComboboxLabel>Vegetables</ComboboxLabel>
            <ComboboxItem value="carrot">Carrot</ComboboxItem>
            <ComboboxItem value="broccoli">Broccoli</ComboboxItem>
            <ComboboxItem value="spinach">Spinach</ComboboxItem>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
}

export const WithDisabledItems: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Search fruit..." className="w-64" />
      <ComboboxContent>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxItem value="apple">Apple</ComboboxItem>
          <ComboboxItem value="banana" disabled>Banana (unavailable)</ComboboxItem>
          <ComboboxItem value="cherry">Cherry</ComboboxItem>
          <ComboboxItem value="grape" disabled>Grape (unavailable)</ComboboxItem>
          <ComboboxItem value="orange">Orange</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput placeholder="Search fruit..." className="w-64" disabled />
      <ComboboxContent>
        <ComboboxList>
          {fruits.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit}>
              {fruit}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
}

const MultiSelectStory = () => {
  const anchor = useComboboxAnchor()
  return (
    <Combobox multiple>
      <ComboboxChips ref={anchor} className="w-64">
        <ComboboxChip>Apple</ComboboxChip>
        <ComboboxChip>Banana</ComboboxChip>
        <ComboboxChipsInput placeholder="Add fruit..." />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxList>
          {fruits.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit}>
              {fruit}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export const MultiSelect: Story = {
  render: () => <MultiSelectStory />,
}

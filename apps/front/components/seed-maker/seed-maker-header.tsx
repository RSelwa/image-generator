"use client"

import { OPTIONS_NUMBER_OF_ROUNDS } from "@repo/common"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SeedMakerHeaderProps = {
  name: string
  onNameChange: (name: string) => void
  roundCount: number
  onRoundCountChange: (count: number) => void
  hasSpecialRounds: boolean
  onHasSpecialRoundsChange: (value: boolean) => void
  onSave: () => void
  isSaving: boolean
  isValid: boolean
}

const SeedMakerHeader = ({
  name,
  onNameChange,
  roundCount,
  onRoundCountChange,
  hasSpecialRounds,
  onHasSpecialRoundsChange,
  onSave,
  isSaving,
  isValid,
}: SeedMakerHeaderProps) => (
  <div className="flex flex-wrap items-center gap-3 p-4 border-b">
    <h1 className="text-lg font-bold mr-2">Seed Maker</h1>

    <Input
      placeholder="Seed name (optional)"
      value={name}
      onChange={(e) => onNameChange(e.target.value)}
      className="w-48"
    />

    <Select
      value={String(roundCount)}
      onValueChange={(v) => onRoundCountChange(Number(v))}
    >
      <SelectTrigger className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS_NUMBER_OF_ROUNDS.map((n) => (
          <SelectItem key={n} value={String(n)}>
            {n} rounds
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <div className="flex items-center gap-2">
      <Checkbox
        id="has-special-rounds"
        checked={hasSpecialRounds}
        onCheckedChange={(checked) => onHasSpecialRoundsChange(!!checked)}
      />
      <Label htmlFor="has-special-rounds" className="text-sm cursor-pointer">
        Special rounds
      </Label>
    </div>

    <Button
      onClick={onSave}
      disabled={isSaving || !isValid}
      className="ml-auto"
    >
      <Save className="size-4 mr-1.5" />
      {isSaving ? "Saving..." : "Save Seed"}
    </Button>
  </div>
)

export default SeedMakerHeader

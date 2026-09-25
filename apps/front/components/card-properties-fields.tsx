import { CARD_RARITY } from "@repo/common"
import { type CardProperties, cardRaritySchema } from "@repo/schemas"
import { type UseFormReturn } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SELECTORS } from "@/constants/testing"

type CardPropertiesFieldsProps = {
  form: UseFormReturn<CardProperties>
}

export const CardPropertiesFields = ({ form }: CardPropertiesFieldsProps) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field>
        <FieldLabel>Rarity</FieldLabel>
        <Select
          value={watch("rarity")}
          onValueChange={(value) => {
            const rarity = cardRaritySchema.safeParse(value).data
            if (rarity) setValue("rarity", rarity)
          }}
        >
          <SelectTrigger data-testid={SELECTORS.CARD_FORM_RARITY}>
            <SelectValue placeholder="Select rarity" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CARD_RARITY).map((rarity) => (
              <SelectItem
                key={rarity}
                value={rarity}
                data-testid={SELECTORS.CARD_FORM_RARITY_OPTION(rarity)}
              >
                {rarity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError errors={[errors.rarity]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="card-properties-number">Number</FieldLabel>
        <Input
          id="card-properties-number"
          type="number"
          data-testid={SELECTORS.CARD_FORM_NUMBER}
          {...register("number", { valueAsNumber: true })}
          aria-invalid={!!errors.number}
        />
        <FieldDescription>
          Unique number of the card in the collection
        </FieldDescription>
        <FieldError errors={[errors.number]} />
      </Field>
    </div>
  )
}

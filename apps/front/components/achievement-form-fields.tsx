import { ACHIEVEMENT_DIFFICULTY } from "@repo/common"
import { type AchievementDoc, achievementDifficultySchema } from "@repo/schemas"
import { type UseFormReturn } from "react-hook-form"
import {
  Field,
  FieldError,
  FieldGroup,
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
import { Textarea } from "@/components/ui/textarea"
import { NO_ACHIEVEMENT_DIFFICULTY } from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"

const toOptionalNumber = (value: string) =>
  value === "" ? undefined : Number(value)

type AchievementFormFieldsProps = {
  form: UseFormReturn<AchievementDoc>
  isKeyReadOnly: boolean
}

export const AchievementFormFields = ({
  form,
  isKeyReadOnly,
}: AchievementFormFieldsProps) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="achievement-key">Key</FieldLabel>
        <Input
          id="achievement-key"
          readOnly={isKeyReadOnly}
          placeholder="change_username"
          className="read-only:text-muted-foreground"
          data-testid={SELECTORS.ACHIEVEMENT_FORM_KEY}
          {...register("key")}
        />
        <FieldError
          errors={[errors.key]}
          data-testid={SELECTORS.ACHIEVEMENT_FORM_KEY_ERROR}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="achievement-name">Name</FieldLabel>
        <Input
          id="achievement-name"
          data-testid={SELECTORS.ACHIEVEMENT_FORM_NAME}
          {...register("name")}
        />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="achievement-description">Description</FieldLabel>
        <Textarea
          id="achievement-description"
          data-testid={SELECTORS.ACHIEVEMENT_FORM_DESCRIPTION}
          {...register("description")}
        />
        <FieldError errors={[errors.description]} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="achievement-reward">Reward (credits)</FieldLabel>
          <Input
            id="achievement-reward"
            type="number"
            data-testid={SELECTORS.ACHIEVEMENT_FORM_REWARD}
            {...register("reward", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.reward]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="achievement-goal">Goal to achieve</FieldLabel>
          <Input
            id="achievement-goal"
            type="number"
            data-testid={SELECTORS.ACHIEVEMENT_FORM_GOAL}
            {...register("goalToAchieve", { setValueAs: toOptionalNumber })}
          />
          <FieldError errors={[errors.goalToAchieve]} />
        </Field>
      </div>
      <Field>
        <FieldLabel>Difficulty</FieldLabel>
        <Select
          value={watch("difficulty") || NO_ACHIEVEMENT_DIFFICULTY}
          onValueChange={(value) =>
            setValue(
              "difficulty",
              achievementDifficultySchema.safeParse(value).data,
            )
          }
        >
          <SelectTrigger data-testid={SELECTORS.ACHIEVEMENT_FORM_DIFFICULTY}>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value={NO_ACHIEVEMENT_DIFFICULTY}
              data-testid={SELECTORS.ACHIEVEMENT_FORM_DIFFICULTY_OPTION(
                NO_ACHIEVEMENT_DIFFICULTY,
              )}
            >
              None
            </SelectItem>
            {Object.values(ACHIEVEMENT_DIFFICULTY).map((difficulty) => (
              <SelectItem
                key={difficulty}
                value={difficulty}
                data-testid={SELECTORS.ACHIEVEMENT_FORM_DIFFICULTY_OPTION(
                  difficulty,
                )}
              >
                {difficulty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError errors={[errors.difficulty]} />
      </Field>
    </FieldGroup>
  )
}

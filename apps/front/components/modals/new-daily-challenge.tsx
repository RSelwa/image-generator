"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { dateToString, DIFFICULTIES, DOCUMENTS_STATUS, stringToDate } from "@repo/common"
import { type CreateDailyChallengeInput, createDailyChallengeInputSchema } from "@repo/schemas"
import { type SubmitHandler, useForm } from "react-hook-form"
import { ModalBase } from "@/components/modals/base"
import { ReactSphere } from "@/components/providers/react-sphere"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MODAL_KEYS } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import { useCreateDailyChallengeFunctionMutation } from "@/redux/api/cloud-functions"
import { useCreateDailyChallengeMutation } from "@/redux/api/daily-challenge"
import { useGetFlatsByGameIdQuery } from "@/redux/api/flat"
import { useGetAllGamesQuery, useGetSphericalsByGameIdQuery } from "@/redux/api/games"
import { useGetMapsByGameIdQuery } from "@/redux/api/maps"

const KEY = MODAL_KEYS.NEW_DAILY_CHALLENGE

const NewDailyChallenge = () => {
  const { closeModal } = useModal(KEY)
  const [createDailyChallenge, { isLoading }] = useCreateDailyChallengeMutation()
  const [createDailyChallengeFunction, { isLoading: isLoadingCreateDailyChallengeFunction }] = useCreateDailyChallengeFunctionMutation()
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(createDailyChallengeInputSchema),
    defaultValues: {
      difficulty: DIFFICULTIES.EASY,
      isSpherical: true,
      gameAlternateNames: [],
    },
  })

  const dateString = watch("date")
  const isSpherical = watch("isSpherical")
  const difficulty = watch("difficulty")
  const gameId = watch("gameId")
  const sphericalId = watch("sphericalId")
  const flatId = watch("flatId")

  const { data: allGames } = useGetAllGamesQuery()
  const { data: sphericals } = useGetSphericalsByGameIdQuery({ gameId: gameId || "" }, { skip: !gameId || !isSpherical })
  const { data: flats } = useGetFlatsByGameIdQuery({ gameId: gameId || "" }, { skip: !gameId || isSpherical })
  const { data: maps } = useGetMapsByGameIdQuery({ gameId: gameId || "" }, { skip: !gameId })

  const readySphericals = sphericals?.filter((s) => s.status === DOCUMENTS_STATUS.READY) || []
  const readyFlats = flats?.filter((f) => f.status === DOCUMENTS_STATUS.READY) || []

  const clearImageFields = () => {
    setValue("sphericalId", null)
    setValue("sphericalImageUrl", null)
    setValue("flatId", null)
    setValue("flatImageUrl", null)
    setValue("mapId", null)
    setValue("mapImage", null)
    setValue("mapWidth", null)
    setValue("mapHeight", null)
    setValue("mapPosition", null)
  }

  const fillMapFields = (mapId: string) => {
    const map = maps?.find((m) => m.id === mapId)
    if (!map) return
    setValue("mapId", map.id)
    setValue("mapImage", map.imageUrl || null)
    setValue("mapWidth", map.width || null)
    setValue("mapHeight", map.height || null)
    setValue("maxDistancePoints", map.maxDistancePoints || null)
  }

  const handleGameSelect = (selectedGameId: string) => {
    const game = allGames?.find((g) => g.id === selectedGameId)
    if (!game) return
    setValue("gameId", game.id)
    setValue("gameTitle", game.title)
    setValue("gameAlternateNames", game.alternateNames || [])
    clearImageFields()
  }

  const handleSphericalSelect = (selectedId: string) => {
    const spherical = readySphericals.find((s) => s.id === selectedId)
    if (!spherical) return
    setValue("sphericalId", spherical.id)
    setValue("sphericalImageUrl", spherical.image)
    setValue("mapPosition", spherical.mapPosition || null)
    if (spherical.mapId) fillMapFields(spherical.mapId)
  }

  const handleFlatSelect = (selectedId: string) => {
    const flat = readyFlats.find((f) => f.id === selectedId)
    if (!flat) return
    setValue("flatId", flat.id)
    setValue("flatImageUrl", flat.image)
    setValue("mapPosition", flat.mapPosition || null)
    if (flat.mapId) fillMapFields(flat.mapId)
  }

  const handleSphericalToggle = (val: boolean) => {
    setValue("isSpherical", val)
    clearImageFields()
  }

  const handleCreateDailyChallengeFunction = async () => {
    if (isLoadingCreateDailyChallengeFunction) return
    try {
      const date = stringToDate(dateString)

      await createDailyChallengeFunction({ date }).unwrap()
    } catch (error) {
      console.error("Failed to create daily challenge via cloud function", error)
    }
  }

  const onSubmit: SubmitHandler<CreateDailyChallengeInput> = async (data) => {
    await createDailyChallenge(data).unwrap()
    reset()
    closeModal()
  }

  return (
    <ModalBase modalKey={KEY} title="New Daily Challenge" className="lg:max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FieldGroup>
          <div className="flex flex-row justify-between">
            <Field>
              <FieldLabel>Date</FieldLabel>
              {dateString && <span className="text-xs text-muted-foreground font-mono">{watch("date")}</span>}
              <FieldError errors={[errors.date]} />
              <Button
                disabled={
                  isLoadingCreateDailyChallengeFunction || !dateString
                }
                onClick={handleCreateDailyChallengeFunction}
              >
                Create Challenge for {dateString}
              </Button>
            </Field>
            <div className="h-75 w-min!">
              <Calendar
                mode="single"
                selected={dateString ? stringToDate(dateString) : undefined}
                onSelect={(day) => day && setValue("date", dateToString(day))}
              />
            </div>
          </div>

          <Field>
            <FieldLabel>Game</FieldLabel>
            <Select value={gameId || ""} onValueChange={handleGameSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {allGames?.map((game) => (
                  <SelectItem key={game.id} value={game.id}>{game.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.gameId, errors.gameTitle]} />
          </Field>

          <Field orientation="horizontal">
            <FieldLabel>Spherical</FieldLabel>
            <Switch checked={isSpherical} onCheckedChange={handleSphericalToggle} />
          </Field>

          <Field>
            <FieldLabel>Difficulty</FieldLabel>
            <Select
              value={difficulty}
              onValueChange={(val) => setValue("difficulty", val as CreateDailyChallengeInput["difficulty"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DIFFICULTIES).map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.difficulty]} />
          </Field>

          {isSpherical && (
            <Field>
              <FieldLabel>Spherical image</FieldLabel>
              <Select
                value={sphericalId || ""}
                onValueChange={handleSphericalSelect}
                disabled={!gameId || readySphericals.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!gameId ? "Select a game first" : "Select a spherical"} />
                </SelectTrigger>
                <SelectContent>
                  {readySphericals.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.sphericalId, errors.sphericalImageUrl]} />
              <div className="h-24 aspect-video">
                {sphericalId && <ReactSphere src={readySphericals.find((s) => s.id === sphericalId)?.image || ""} />}
              </div>
            </Field>
          )}

          {!isSpherical && (
            <Field>
              <FieldLabel>Flat image</FieldLabel>
              <Select
                value={flatId || ""}
                onValueChange={handleFlatSelect}
                disabled={!gameId || readyFlats.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!gameId ? "Select a game first" : "Select a flat"} />
                </SelectTrigger>
                <SelectContent>
                  {readyFlats.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.flatId, errors.flatImageUrl]} />
              <div className="w-full h-24">
                {flatId && <img src={readyFlats.find((f) => f.id === flatId)?.image} alt="Flat preview" className="h-full w-full object-cover" />}
              </div>
            </Field>
          )}

          {watch("mapId") && (
            <>
              <p className="text-sm font-semibold text-muted-foreground pt-2">Map</p>
              <Field>
                <FieldLabel>Map ID</FieldLabel>
                <Input {...register("mapId")} />
                <FieldError errors={[errors.mapId]} />
              </Field>
              <Field>
                <FieldLabel>Map Image URL</FieldLabel>
                <Input {...register("mapImage")} />
                <FieldError errors={[errors.mapImage]} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Width</FieldLabel>
                  <Input type="number" {...register("mapWidth", { valueAsNumber: true })} />
                  <FieldError errors={[errors.mapWidth]} />
                </Field>
                <Field>
                  <FieldLabel>Height</FieldLabel>
                  <Input type="number" {...register("mapHeight", { valueAsNumber: true })} />
                  <FieldError errors={[errors.mapHeight]} />
                </Field>
              </div>
              <Field>
                <FieldLabel>Max Distance Points (%)</FieldLabel>
                <Input type="number" {...register("maxDistancePoints", { valueAsNumber: true })} />
                <FieldError errors={[errors.maxDistancePoints]} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Position X</FieldLabel>
                  <Input type="number" step="any" {...register("mapPosition.x", { valueAsNumber: true })} />
                </Field>
                <Field>
                  <FieldLabel>Position Y</FieldLabel>
                  <Input type="number" step="any" {...register("mapPosition.y", { valueAsNumber: true })} />
                </Field>
              </div>
            </>
          )}
        </FieldGroup>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="marathon-outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </ModalBase>
  )
}

export default NewDailyChallenge

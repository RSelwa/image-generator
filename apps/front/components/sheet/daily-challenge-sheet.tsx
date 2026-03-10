"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { dateToString, DIFFICULTIES, DOCUMENTS_STATUS, stringToDate } from "@repo/common"
import { type DailyChallengeDocWithId, updateDailyChallengeInputSchema } from "@repo/schemas"
import { useQueryState } from "nuqs"
import { useEffect } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { type z } from "zod"
import { ReactSphere } from "@/components/providers/react-sphere"
import { EmptySheet } from "@/components/sheet/empty"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { QUERY_PARAMS } from "@/constants/mapping"
import {
  useDeleteDailyChallengeMutation,
  useGetDailyChallengeByDateQuery,
  useUpdateDailyChallengeMutation,
} from "@/redux/api/daily-challenge"
import { useGetFlatsByGameIdQuery } from "@/redux/api/flat"
import { useGetAllGamesQuery, useGetSphericalsByGameIdQuery } from "@/redux/api/games"
import { useGetMapsByGameIdQuery } from "@/redux/api/maps"

type FormValues = z.infer<typeof updateDailyChallengeInputSchema>

const DailyChallengeForm = ({ challenge }: { challenge: DailyChallengeDocWithId }) => {
  const [, setDate] = useQueryState(QUERY_PARAMS.DAILY_CHALLENGE_DATE)
  const [updateDailyChallenge, { isLoading }] = useUpdateDailyChallengeMutation()
  const [deleteDailyChallenge] = useDeleteDailyChallengeMutation()

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(updateDailyChallengeInputSchema),
    defaultValues: {
      date: challenge.date,
      gameId: challenge.gameId,
      gameTitle: challenge.gameTitle,
      gameAlternateNames: challenge.gameAlternateNames,
      isSpherical: challenge.isSpherical,
      difficulty: challenge.difficulty,
      sphericalId: challenge.sphericalId || undefined,
      sphericalImageUrl: challenge.sphericalImageUrl || undefined,
      flatId: challenge.flatId || undefined,
      flatImageUrl: challenge.flatImageUrl || undefined,
      mapId: challenge.mapId || undefined,
      mapImage: challenge.mapImage || undefined,
      mapWidth: challenge.mapWidth || undefined,
      mapHeight: challenge.mapHeight || undefined,
      maxDistancePoints: challenge.maxDistancePoints || undefined,
    },
  })

  useEffect(() => {
    reset({
      date: challenge.date,
      gameId: challenge.gameId,
      gameTitle: challenge.gameTitle,
      gameAlternateNames: challenge.gameAlternateNames,
      isSpherical: challenge.isSpherical,
      difficulty: challenge.difficulty,
      sphericalId: challenge.sphericalId || undefined,
      sphericalImageUrl: challenge.sphericalImageUrl || undefined,
      flatId: challenge.flatId || undefined,
      flatImageUrl: challenge.flatImageUrl || undefined,
      mapId: challenge.mapId || undefined,
      mapImage: challenge.mapImage || undefined,
      mapWidth: challenge.mapWidth || undefined,
      mapHeight: challenge.mapHeight || undefined,
      maxDistancePoints: challenge.maxDistancePoints || undefined,
    })
  }, [challenge, reset])

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
    setValue("sphericalId", undefined)
    setValue("sphericalImageUrl", undefined)
    setValue("flatId", undefined)
    setValue("flatImageUrl", undefined)
    setValue("mapId", undefined)
    setValue("mapImage", undefined)
    setValue("mapWidth", undefined)
    setValue("mapHeight", undefined)
    setValue("mapPosition", undefined)
  }

  const fillMapFields = (mapId: string) => {
    const map = maps?.find((m) => m.id === mapId)
    if (!map) return
    setValue("mapId", map.id)
    setValue("mapImage", map.imageUrl || undefined)
    setValue("mapWidth", map.width || undefined)
    setValue("mapHeight", map.height || undefined)
    setValue("maxDistancePoints", map.maxDistancePoints || undefined)
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
    setValue("mapPosition", spherical.mapPosition || undefined)
    if (spherical.mapId) fillMapFields(spherical.mapId)
  }

  const handleSphericalToggle = (val: boolean) => {
    setValue("isSpherical", val)
    clearImageFields()
  }

  const handleFlatSelect = (selectedId: string) => {
    const flat = readyFlats.find((f) => f.id === selectedId)
    if (!flat) return
    setValue("flatId", flat.id)
    setValue("flatImageUrl", flat.image)
    setValue("mapPosition", flat.mapPosition || undefined)
    if (flat.mapId) fillMapFields(flat.mapId)
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await updateDailyChallenge({ date: challenge.date, data })
  }

  const handleDelete = async () => {
    await deleteDailyChallenge({ date: challenge.date })
    setDate(null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>Daily Challenge</SheetTitle>
        <SheetDescription>{challenge.date}</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <FieldGroup>
          <Field>
            <FieldLabel className="flex items-center gap-2">
              Date
              {watch("date") && <span className="text-xs text-muted-foreground font-mono">{watch("date")}</span>}
            </FieldLabel>
            <Calendar
              mode="single"
              selected={watch("date") ? stringToDate(watch("date") || "") : undefined}
              onSelect={(day) => day && setValue("date", dateToString(day))}
            />
            <FieldError errors={[errors.date]} />
          </Field>

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
            <Switch
              checked={isSpherical}
              onCheckedChange={(val) => handleSphericalToggle(val)}
            />
          </Field>

          <Field>
            <FieldLabel>Difficulty</FieldLabel>
            <Select
              value={difficulty}
              onValueChange={(val) => setValue("difficulty", val as FormValues["difficulty"])}
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
              <FieldLabel>
                Spherical image
              </FieldLabel>
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
              <FieldLabel>
                Flat image

              </FieldLabel>
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
      </div>

      <SheetFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="marathon-destructive">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this daily challenge?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="marathon-outline" asChild>
                <Button>No, keep it</Button>
              </AlertDialogCancel>
              <AlertDialogAction variant="marathon-destructive" asChild onClick={handleDelete}>
                <Button>Yes, delete</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetFooter>
    </form>
  )
}

export const DailyChallengeSheet = () => {
  const [date, setDate] = useQueryState(QUERY_PARAMS.DAILY_CHALLENGE_DATE)
  const { data: challenge } = useGetDailyChallengeByDateQuery({ date: date || "" }, { skip: !date })

  const open = Boolean(date)

  if (!challenge) return (
    <Sheet open={open} onOpenChange={(open) => !open && setDate(null)}>
      <EmptySheet />
    </Sheet>
  )

  return (
    <Sheet open={open} onOpenChange={(open) => !open && setDate(null)}>
      <SheetContent className="flex flex-col">
        <DailyChallengeForm challenge={challenge} />
      </SheetContent>
    </Sheet>
  )
}

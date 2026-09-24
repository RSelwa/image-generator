"use client"

import { PlusIcon, RefreshCcw, Search } from "lucide-react"
import { useQueryState } from "nuqs"
import { useState } from "react"
import { AchievementSheet } from "@/components/sheet/achievement-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ACHIEVEMENT_DIFFICULTY_TO_BADGE_VARIANT,
  MODAL_KEYS,
  QUERY_PARAMS,
} from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"
import { useModal } from "@/hooks/use-modal"
import { useGetAllAchievementsQuery } from "@/redux/api/achievements"

const Page = () => {
  const { openModal } = useModal(MODAL_KEYS.NEW_ACHIEVEMENT, "new")
  const {
    data: achievements,
    isLoading,
    refetch,
  } = useGetAllAchievementsQuery()

  const [, setAchievementKey] = useQueryState(QUERY_PARAMS.ACHIEVEMENT_KEY)
  const [input, setInput] = useState("")

  const search = input.toLowerCase()
  const filtered =
    achievements?.filter(
      ({ key, name }) =>
        key.toLowerCase().includes(search) ||
        name.toLowerCase().includes(search),
    ) || []

  return (
    <main className="h-full-height-admin max-h-full-height-admin p-4 space-y-4">
      <section className="flex flex-col gap-2 lg:gap-8 lg:flex-row justify-between lg:items-center">
        <h1 className="text-2xl font-bold space-x-4">
          Achievements -{" "}
          <span className="text-primary">{achievements?.length || 0}</span>
          <Button size="icon" variant="marathon-white" onClick={refetch}>
            <RefreshCcw className="size-4" />
          </Button>
        </h1>
        <InputGroup className="lg:w-fit w-full min-w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by key or name"
            autoComplete="off"
          />
        </InputGroup>
        <Button
          onClick={() => openModal()}
          className="lg:ml-auto"
          data-testid={SELECTORS.ADMIN_ACHIEVEMENT_NEW}
        >
          <PlusIcon className="size-4" />
          New Achievement
        </Button>
      </section>

      <ScrollArea className="h-5/6">
        <Table noWrapper>
          <TableCaption>
            {isLoading && "Loading..."}
            {!isLoading && "All achievements loaded"}
          </TableCaption>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Goal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((achievement) => (
              <TableRow
                key={achievement.key}
                onClick={() => setAchievementKey(achievement.key)}
                className="cursor-pointer"
                data-testid={SELECTORS.ADMIN_ACHIEVEMENT_ROW(achievement.key)}
              >
                <TableCell className="font-mono">{achievement.key}</TableCell>
                <TableCell className="font-medium">
                  {achievement.name}
                </TableCell>
                <TableCell className="max-w-80 truncate text-muted-foreground">
                  {achievement.description}
                </TableCell>
                <TableCell className="font-mono">
                  {achievement.reward}
                </TableCell>
                <TableCell>
                  {achievement.difficulty && (
                    <Badge
                      variant={
                        ACHIEVEMENT_DIFFICULTY_TO_BADGE_VARIANT[
                          achievement.difficulty
                        ]
                      }
                    >
                      {achievement.difficulty}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-mono">
                  {achievement.goalToAchieve}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <AchievementSheet />
    </main>
  )
}

export default Page

"use client"

import { useTranslations } from "next-intl"
import { LobbyHistoryCard } from "@/app/[locale]/(app)/history/lobby-card"
import { AuthGuard } from "@/components/guards/auth-guard"
import Loader from "@/components/icons/loader"
import { Button } from "@/components/ui/button"
import { useGetMyLobbyHistoryInfiniteQuery } from "@/redux/api/lobby"
import { selectUserId } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"

const HistoryContent = () => {
  const t = useTranslations("history")
  const userId = useAppSelector(selectUserId)

  const {
    data,
    isFetching,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetMyLobbyHistoryInfiniteQuery({ userId }, { skip: !userId })

  const lobbies = data?.pages.flat() || []

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="size-8" />
      </div>
    )
  }

  if (lobbies.length === 0 && !isFetching) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("noGames")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3" data-testid="lobby-history-list">
        {lobbies.map((lobby) => (
          <LobbyHistoryCard key={lobby.id} lobby={lobby} />
        ))}
      </div>
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="marathon-outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            data-testid="load-more-button"
          >
            {isFetchingNextPage && <Loader className="size-4" />}
            {t("loadMore")}
          </Button>
        </div>
      )}
    </div>
  )
}

const HistoryPage = () => {
  const t = useTranslations("history")

  return (
    <AuthGuard>
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="history-page-title">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <HistoryContent />
      </main>
    </AuthGuard>
  )
}

export default HistoryPage

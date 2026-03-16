"use client"

import { LOBBY_STATUS } from "@repo/common"
import { type LobbyDocWithId } from "@repo/schemas"
import { Calendar, Hash, Trophy, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PAGES } from "@/constants/pages"
import { Link } from "@/i18n/routing"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    [LOBBY_STATUS.FINISHED]: "default",
    [LOBBY_STATUS.PLAYING]: "secondary",
    [LOBBY_STATUS.WAITING]: "outline",
    [LOBBY_STATUS.STARTING]: "outline",
}

const formatLobbyDate = (lobby: LobbyDocWithId) => {
    if (!lobby.createdAt) return null

    const timestamp = lobby.createdAt

    return new Date(timestamp.seconds * 1000).toLocaleDateString()
}

export const LobbyHistoryCard = ({ lobby }: { lobby: LobbyDocWithId }) => {
    const createdAt = formatLobbyDate(lobby)

    return (
        <Link href={`${PAGES.LOBBY}/${lobby.id}`} data-testid="lobby-history-card">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium font-interference">
                        <div className="flex items-center gap-2">
                            <Hash className="size-4" />
                            {lobby.code}
                        </div>
                    </CardTitle>
                    <Badge variant={STATUS_VARIANT[lobby.status] || "outline"} data-testid="lobby-status-badge">
                        {lobby.status}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Users className="size-3.5" />
                            {lobby.players.length}
                            {" "}
                            player
                            {lobby.players.length !== 1 && "s"}
                        </div>
                        <div className="flex items-center gap-1">
                            <Trophy className="size-3.5" />
                            {lobby.config.numberOfRounds}
                            {" "}
                            rounds
                        </div>
                        {createdAt && (
                            <div className="flex items-center gap-1">
                                <Calendar className="size-3.5" />
                                {createdAt}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

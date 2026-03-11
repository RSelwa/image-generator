import {
    Armchair,
    Calendar,
    Gamepad2,
    Globe2,
    Image,
    Lightbulb,
    Music2,
    Sprout,
    User,
} from "lucide-react"

import Link from "next/link"
import { LobbyDebug } from "@/components/lobby/lobby-debug"
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { PAGES } from "@/constants/pages"

const NavUserAdmin = () => {
    return (
        <>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>Admin</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.ADMIN_USERS} className="cursor-pointer">
                            <User />
                            Users
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.ADMIN_GAMES} className="cursor-pointer">
                            <Gamepad2 />
                            Games
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.ADMIN_SPHERICAL} className="cursor-pointer">
                            <Globe2 />
                            Sphericals
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.ADMIN_FLATS} className="cursor-pointer">
                            <Image />
                            Flats
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.ADMIN_LOBBIES} className="cursor-pointer">
                            <Armchair />
                            Lobbies
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.ADMIN_SUGGESTIONS} className="cursor-pointer">
                            <Lightbulb />
                            Suggestions
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.ADMIN_DAILY_CHALLENGE} className="cursor-pointer">
                            <Calendar />
                            Daily Challenges
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.SEED_MAKER} className="cursor-pointer">
                            <Gamepad2 />
                            Make a round
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.MY_SEEDS} className="cursor-pointer">
                            <Sprout />
                            My Seeds
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.ADMIN_SOCIALS} className="cursor-pointer">
                            <Sprout />
                            Socials
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={PAGES.ADMIN_SOUNDS} className="cursor-pointer">
                            <Music2 />
                            Sounds
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuSub>
            <LobbyDebug />
            <DropdownMenuSeparator />
        </>
    )
}

export default NavUserAdmin

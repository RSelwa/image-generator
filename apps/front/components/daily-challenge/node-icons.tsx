import { type ConstantValues } from "@repo/common"
import { PixelatedCheck, Spinner } from "@/components/icons"
import { type SIDE } from "@/constants/daily-challenges"
import { DAILY_CHALLENGES_VARIANTS } from "@/constants/daily-challenges"
import { SVG_URLS } from "@/constants/images"

type Props = { variant: ConstantValues<typeof DAILY_CHALLENGES_VARIANTS> }

export const DailyChallengeContent = ({ variant }: Props) => {
    if (variant === DAILY_CHALLENGES_VARIANTS.TODAY) return <Spinner name="pulse" />

    if (variant === DAILY_CHALLENGES_VARIANTS.COMPLETED_TODAY) return <PixelatedCheck className="size-7" />

    if (variant === DAILY_CHALLENGES_VARIANTS.COMPLETED) return <PixelatedCheck className="size-7" />

    if (variant === DAILY_CHALLENGES_VARIANTS.AVAILABLE) return (
        <div className="group size-full relative flex justify-center items-center bg-background ">
            <span className="transition-all group-hover:size-5 pointer-events-none absolute top-0 left-0 size-3 border-t-2 border-l-2 border-marathon-yellow" />
            <span className="transition-all group-hover:size-5 pointer-events-none absolute top-0 right-0 size-3 border-t-2 border-r-2 border-marathon-yellow" />
            <span className="transition-all group-hover:size-5 pointer-events-none absolute bottom-0 left-0 size-3 border-b-2 border-l-2 border-marathon-yellow" />
            <span className="transition-all group-hover:size-5 pointer-events-none absolute bottom-0 right-0 size-3 border-b-2 border-r-2 border-marathon-yellow" />
            <Spinner name="pulse" />
        </div>
    )

    if (variant === DAILY_CHALLENGES_VARIANTS.FUTURE) return <Spinner name="cascade" />

    if (variant === DAILY_CHALLENGES_VARIANTS.EMPTY) return <span className="size-full bg-size-[40px] bg-background bg - repeat grayscale" style={{ backgroundImage: `url(${SVG_URLS.DIAGONAL_STRIPS})` }} />

    if (variant === DAILY_CHALLENGES_VARIANTS.LOADING) return <Spinner className="bg-background" name="diagswipe" />

    return <span className="size-full bg-background bg-size-[40px] bg-repeat grayscale" style={{ backgroundImage: `url(${SVG_URLS.DIAGONAL_STRIPS})` }} />
}

export const DailyChallengeLabel = ({ variant, side }: Props & { side: ConstantValues<typeof SIDE> }) => {
    if (variant === DAILY_CHALLENGES_VARIANTS.TODAY) return (
        <>
            <div className="absolute bg-inherit -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="bg-inherit font-shapiro-wide px-3 py-1.5">
                    TODAY
                </span>
            </div>

            <span data-side={side} className="absolute hidden lg:block top-1/2 -translate-y-1/2 data-[side=right]:-right-32 data-[side=left]:-left-32 bg-inherit px-3 py-0.5">Play now</span>
        </>

    )

    if (variant === DAILY_CHALLENGES_VARIANTS.FUTURE) return (
        <span data-side={side} className="absolute hidden lg:block top-1/2 -translate-y-1/2 data-[side=right]:-right-28 data-[side=right]:origin-left data-[side=left]:-left-28 data-[side=left]:origin-right bg-inherit px-3 py-0.5">Incoming</span>
    )

    if (variant === DAILY_CHALLENGES_VARIANTS.COMPLETED) return (
        <span data-side={side} className="absolute hidden lg:block top-1/2 -translate-y-1/2 data-[side=right]:-right-32 data-[side=left]:-left-32 bg-blue-accent-foreground px-3 py-0.5">Completed</span>
    )

    if (variant === DAILY_CHALLENGES_VARIANTS.AVAILABLE) return (
        <span data-side={side} className="absolute hidden lg:block top-1/2 -translate-y-1/2 data-[side=right]:-right-48 data-[side=left]:-left-48 bg-marathon-yellow px-3 py-0.5">Level available</span>
    )

    return null
}

import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { type ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { cn } from "@/utils"

type Props = {
    imageLink: string
    title: string
    description: string
}

export const HomeArticles = ({ className, href, imageLink, title, description, ...props }: Props & ComponentProps<typeof Link>) => {
    const t = useTranslations("home")

    return (
        <Link href={href} className={cn("w-full bg-background flex flex-col border border-neutral-900", className)} {...props}>
            <Image src={imageLink} width={400} height={400} alt={`Image of ${description}`} className="w-full object-cover h-full lg:h-[25vw]" />
            <p className="p-3 text-base uppercase font-interference">{description}</p>
            <h2 className="pb-6 px-3 font-shapiro-wide lg:text-2xl text-3xl">{title}</h2>
            <Button variant="marathon-white" className="self-end mt-auto" size="lg">{t("readMore")} <ArrowUpRight className="size-6" /></Button>
        </Link>
    )
}

type ArticlesDescriptionProps = {
    subTitle: string
    title: string
    description: string
    link: string
    variant?: "black" | "white"
}

export const ArticlesDescription = ({ subTitle, title, description, link, className, variant = "black" }: ArticlesDescriptionProps & ComponentProps<"div">) => {
    const t = useTranslations("home")

    return (
        <article data-variant={variant} className={cn("relative data-[variant=black]:bg-background data-[variant=black]:text-foreground data-[variant=white]:bg-foreground data-[variant=white]:text-background flex flex-col gap-4 py-6 px-3 pb-16", className)}>
            <h4 className="uppercase font-interference">
                {subTitle}
            </h4>
            <h3 className="text-4xl font-shapiro-wide">
                {title}
            </h3>
            <p className="text-black/60">
                {description}
            </p>
            <Link href={link} target="_blank" className="absolute bottom-0 right-0">
                <Button variant="marathon-black" size="xl">{t("discoverMore")} <ArrowUpRight className="size-6" /></Button>
            </Link>
        </article>
    )
}

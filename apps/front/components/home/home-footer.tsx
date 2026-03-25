import { UMA_STUDIO_URL } from "@repo/common"
import { ArrowUpRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import * as React from "react"
import { LogoIcon, StripsBlock } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { PAGES } from "@/constants/pages"
import { FOOTER_LEGALS, FOOTER_SOCIALS, PORTFOLIO_LINK } from "@/constants/social"

const FOOTER_INTERNAL_LINKS = [
    { label: "Dashboard", href: PAGES.DASHBOARD },
    { label: "My Seeds", href: PAGES.MY_SEEDS },
    { label: "Blog", href: "/blog" },
    { label: "History", href: PAGES.HISTORY },
    { label: "Account", href: PAGES.ACCOUNT },
]

const HomeFooter = () => {
    const t = useTranslations("footer")

    return (
        <footer className="grid font-mono border-t border-foreground grid-cols-1 lg:grid-cols-4 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_fit] pb-8">
            <section className="lg:row-start-1 lg:col-start-3 inset-shadow-marathon-white p-4 lg:h-44 text-sm font-mono uppercase">
                {t("tagline")}

            </section>
            <section className="inset-shadow-marathon grid grid-cols-3 mt-auto lg:row-start-1 lg:col-start-1">
                <p className="border-primary border-r p-4 ">({FOOTER_SOCIALS.length})</p>
                <p className="p-4 col-span-2">{t("socialMedias")}</p>
            </section>
            <section className="inset-shadow-marathon lg:col-start-1 lg:row-start-2 p-4 flex flex-col">
                {FOOTER_INTERNAL_LINKS.map(({ label, href }) => (
                    <Link key={label} href={href}>
                        <Button variant="marathon-link" className="px-0! gap-0 text-primary text-xs">
                            [
                            <ArrowUpRight className="size-4" />
                            ]
                            {label}
                        </Button>
                    </Link>
                ))}
            </section>
            <section className="inset-shadow-marathon lg:col-start-2 lg:row-start-2 p-4 flex flex-col">
                {FOOTER_SOCIALS.map(({ label, href }) => (
                    <Link key={label} href={href} target="_blank">
                        <Button variant="marathon-link" className="px-0! gap-0 text-primary text-xs">
                            [
                            <ArrowUpRight className="size-4" />
                            ]
                            {label}
                        </Button>
                    </Link>
                ))}

            </section>
            <section className="relative lg:col-start-3 lg:row-start-2">
                <StripsBlock className="text-primary absolute h-full right-0" />
            </section>
            <section className="lg:col-start-4 lg:row-start-2 inset-shadow-marathon-white h-fit p-4 flex flex-col">
                {FOOTER_LEGALS.map(({ label, href }) => (
                    <Link key={label} href={href} target="_blank">
                        <Button variant="marathon-link" className="px-0! gap-0 text-xs">
                            [<ArrowUpRight className="size-4" />] {label}
                        </Button>
                    </Link>
                ))}
            </section>
            <section className="lg:col-start-1 lg:row-start-3">
                <LogoIcon className="lg:w-2/3" />
            </section>
            <section className="lg:col-start-3 lg:col-span-2 lg:row-start-3 flex items-center justify-start text-xs p-4 inset-shadow-marathon-white">
                <p>
                    <span className="font-bold">
                        {t("copyright")}
                    </span>
                    {" "}
                    {new Date().getFullYear()}
                    . {t("allRightsReserved")}
                    {" "}
                    <Link href={PORTFOLIO_LINK} target="_blank" className="underline">ME</Link>
                    . {t("interfacesBy")}
                    {" "}
                    <Link href={UMA_STUDIO_URL} target="_blank" className="underline">UMA Studio</Link>
                    .
                </p>
            </section>
        </footer>
    )
}

export default HomeFooter

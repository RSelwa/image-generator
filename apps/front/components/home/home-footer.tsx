import { UMA_STUDIO_URL } from "@repo/common"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { LogoIcon, StripsBlock } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { FOOTER_LEGALS, FOOTER_SOCIALS, PORTFOLIO_LINK } from "@/constants/social"

const HomeFooter = () => {
    return (
        <footer className="grid font-mono border-t border-foreground grid-cols-1 lg:grid-cols-4 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_fit] pb-8">
            <section className="lg:row-start-1 lg:col-start-3 inset-shadow-marathon-white p-4 lg:h-44 text-sm font-mono uppercase">
                TWO STICKS AND THEN FIRE. THAT IS ALL IT TAKES. NOT SO DIFFICULT. NOT SO COMPLEX. PROMETHEUS WASN'T A GENIUS. HE WAS SIMPLY A THIEF WHO CHANGED THE WORLD.

            </section>
            <section className="inset-shadow-marathon grid grid-cols-3 mt-auto lg:row-start-1 lg:col-start-1">
                <p className="border-primary border-r p-4 ">({FOOTER_SOCIALS.length})</p>
                <p className="p-4 col-span-2">Social Medias</p>
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
                        Geo gamer ©
                    </span>
                    {" "}
                    {new Date().getFullYear()}
                    . All rights reserved. This project is a fan-made, non-commercial initiative created out of passion for the game and its community. Developed by
                    {" "}
                    <Link href={PORTFOLIO_LINK} target="_blank" className="underline">me</Link>
                    . Interfaces by
                    {" "}
                    <Link href={UMA_STUDIO_URL} target="_blank" className="underline">UMA Studio</Link>
                    .
                </p>
            </section>
        </footer>
    )
}

export default HomeFooter

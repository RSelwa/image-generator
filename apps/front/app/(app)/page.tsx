import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ArticlesDescription, HomeArticles } from "@/components/home/home-articles"
import { CreateLobbyContainer } from "@/components/home/home-create-lobby"
import HomeFooter from "@/components/home/home-footer"
import { HomeStrips } from "@/components/home/home-strips"
import { LogoWithIcon, MiniStrips } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { HOME_ARTICLES } from "@/constants/articles"

const Page = () => {
  return (
    <main className="h-full-height">
      <section className="relative h-full-height">
        <CreateLobbyContainer />
        <HomeStrips />
        <article className="absolute bottom-18 w-5/6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:w-auto lg:bottom-9 lg:left-24">
          <LogoWithIcon className="lg:h-48" />
        </article>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <article className="px-5 py-6 flex flex-col">
          <h2 className="mb-3 font-interference">Actualités</h2>
          <h1 className="mb-6 text-4xl lg:text-6xl font-shapiro-wide">Geo gamer</h1>
          <p className="lg:w-1/2 mb-8 font-sans opacity-60">
            Restez à l'écoute avec nos dernières actualités, incluant les sorties à venir, les mises à jour des développeurs et des informations sur les tests de jeu.
          </p>
          <Button variant="marathon-white" className="lg:w-1/2">See all <ArrowUpRight className="size-6" /></Button>
        </article>
        <article className="bg-primary text-primary-foreground flex flex-col justify-between">
          <div className="p-5">
            <MiniStrips className="h-5 mb-7" />
            <h2 className="font-shapiro-wide lg:mb-6 lg:text-4xl">Play now</h2>
            <p className="lg:w-1/2">
              Coming March 5, 2026 to PlayStation 5, Steam, and Xbox Series X|S with full cross play and cross save.
            </p>
          </div>
          <div className="border-t border-background grid grid-cols-2">
            <Link href="#" className="p-5 border-r border-background flex items-center justify-center gap-2">
              Instagram
            </Link>
            <Link href="#" className="p-5 border-r border-background flex items-center justify-center gap-2">
              Tiktok
            </Link>
          </div>
        </article>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-4">
        {HOME_ARTICLES.map((article, index) => (
          <HomeArticles key={index} {...article} className={index === 2 ? "lg:col-start-4" : ""} />
        ))}
      </section>
      <section className="px-5 py-16 lg:py-32">
        <h3 className="font-interference uppercase mb-3">
          UN JEU DE TIR DE SURVIE À EXTRACTION JcJcE À LA PREMIÈRE PERSONNE
        </h3>
        <h2 className="font-shapiro-wide font-bold text-5xl lg:text-9xl">
          FROM THE CREATORS OF HALO AND DESTINY
        </h2>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-between lg:w-1/2">
          <article className="p-5 font-mono space-y-4 uppercase">
            <p>
              Infiltrez-vous dans le sombre univers de science-fiction de Tau Ceti IV : une colonie dévastée où l'on retrouve des Coureurs, des forces de sécurité de l'UESC et un environnement imprévisible. Alors que vous la parcourez pour trouver des objets de valeur, en solo ou avec une équipe, votre exploration peut se transformer en combat JcJ effréné.
            </p>
            <p>
              Exfiltrez-vous pour vous constituer un équipement impressionnant avec votre butin volé. Mettez-le ensuite à l'épreuve en partant à la conquête de butin encore plus grandiose.
            </p>
          </article>
          <ArticlesDescription subTitle="A GRAVEYARD OF POSSIBILITIES" title="TAU CETI IV" description={"Pénétrez illégalement dans des centres de recherche, des zones inhospitalières et des avant-postes de sécurité qui renferment les vestiges d'une expédition disparue. Chaque zone augmente en difficulté pour vous préparer à l'UESC Marathon qui vous attend dans les cieux."} link="#" variant="white" />
        </div>
        <Image src="/articles/shoot.jpg" alt="Shoot image" height={650} width={650} className="size-full" />
      </section>
      <section className="relative flex flex-col">
        <Image src="/articles/shoot.jpg" alt="Shoot image" height={650} width={650} className="w-full lg:h-full-height object-cover" />
        <ArticlesDescription subTitle="POWERFUL. CONFIGURABLE. EXPENDABLE." title="DEATH DEALERS" description="Runner shells offer diverse playstyle foundations to build upon. Scavenge an arsenal of moddable weapons, body implants, and core system upgrades to craft countless builds. Strategize as a crew to form comps that maximize your combined strengths." link="#" variant="white" className="lg:absolute bottom-0 right-0 lg:w-1/3" />
      </section>
      <HomeFooter />
    </main>
  )
}

export default Page

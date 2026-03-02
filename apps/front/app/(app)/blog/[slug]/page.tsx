import { ArrowLeft } from "lucide-react"
import { type Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BLOG_POST_BY_SLUG, BLOG_POSTS } from "@/constants/blog"
import { PAGES } from "@/constants/pages"

export const generateStaticParams = () =>
  Object.values(BLOG_POSTS).map((post) => ({ slug: post.slug }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const post = BLOG_POST_BY_SLUG(slug)
  if (!post) return {}

  return {
    title: `${post.title} — Geo Gamer`,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: "article",
    },
  }
}

const BlogPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const post = BLOG_POST_BY_SLUG(slug)

  if (!post) notFound()

  return (
    <main className="max-w-3xl mx-auto px-5 py-16 md:py-24">
      <Link
        href={PAGES.HOME}
        className="inline-flex items-center gap-2 font-interference uppercase text-sm opacity-60 hover:opacity-100 mb-12"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>

      <header className="mb-16">
        <p className="font-interference uppercase text-sm mb-4 opacity-60">
          {post.publishedAt} · {post.readingTime} min read
        </p>
        <h1 className="font-shapiro-wide text-4xl md:text-6xl mb-6 leading-tight">
          {post.title}
        </h1>
        <p className="text-lg opacity-60 leading-relaxed">
          {post.metaDescription}
        </p>
      </header>

      <article className="space-y-14">
        {post.sections.map((section, i) => (
          <section key={i}>
            <h2 className="font-shapiro-wide text-2xl mb-5">
              {section.heading}
            </h2>
            <div className="space-y-4">
              {section.paragraphs.map((p, j) => (
                <p key={j} className="opacity-80 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
            {section.items && (
              <ul className="mt-5 space-y-3 border-l-2 border-primary pl-5">
                {section.items.map((item, k) => (
                  <li key={k} className="opacity-80 leading-relaxed">
                    <strong className="font-shapiro-wide">{item.label}</strong>
                    {" "}
                    {item.text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </main>
  )
}

export default BlogPage

// app/api/proxy-image/route.ts
export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) return new Response("Missing url", { status: 400 })

  const response = await fetch(imageUrl)

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  })
}

// app/api/proxy-image/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) return new Response("Missing url", { status: 400 })

  const response = await fetch(imageUrl)
  const buffer = await response.arrayBuffer()

  return new Response(buffer, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  })
}

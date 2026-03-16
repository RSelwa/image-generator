import { dailyChallengeDocSchema } from "@repo/schemas"
import { ImageResponse } from "next/og"
import { API_ENDPOINTS } from "@/constants/mapping"

// Image metadata
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = "image/png"

// Image generation
export default async function Image({ params: { date } }: { params: { date: string } }) {
    const res = await fetch(API_ENDPOINTS.DAILY_CHALLENGE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ date }),
    })
    const data = await res.json()

    const { data: challenge, error } = dailyChallengeDocSchema.safeParse(data?.dailyChallenge)

    if (error) {
        console.error("Failed to parse daily challenge data:", error)

        return new Response("Failed to generate image", { status: 500 })
    }

    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 128,
                    background: "white",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {challenge.gameTitle}
            </div>
        )
    )
}

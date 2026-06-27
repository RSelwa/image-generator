import { ImageResponse } from "next/og"

// Image metadata
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = "image/png"

// Image generation
// Never render the game title (the answer) here: this image is shown in every
// link preview, so it would leak the solution before the player can guess.
export default async function Image({ params: { date } }: { params: { date: string } }) {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    background: "white",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 24,
                }}
            >
                <div style={{ fontSize: 96, fontWeight: 700 }}>Daily Challenge</div>
                <div style={{ fontSize: 48, color: "#666" }}>{date}</div>
            </div>
        )
    )
}

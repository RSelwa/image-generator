import { type ReactNode } from "react"

export default function CaptureLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className="pt-0!">
                {children}
            </body>
        </html>
    )
}

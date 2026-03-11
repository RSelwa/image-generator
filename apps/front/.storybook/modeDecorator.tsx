import { useEffect, useState } from "react"

const fontFaces = `
  @font-face {
    font-family: 'Fraktion';
    src: url('/fonts/Fraktion.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Fraktion Mono';
    src: url('/fonts/Fraktion-mono.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Interference';
    src: url('/fonts/Interference.otf') format('opentype');
  }
  @font-face {
    font-family: 'Shapiro';
    src: url('/fonts/Shapiro.otf') format('opentype');
  }
  @font-face {
    font-family: 'Shapiro-Wide';
    src: url('/fonts/Shapiro-wide.woff2') format('woff2');
  }
`

export const ModeDecorator = (Story: any) => {
    const [isDarkMode, setIsDarkMode] = useState(false)

    const toggleMode = () => {
        setIsDarkMode(!isDarkMode)
        document.documentElement.classList.toggle("dark", !isDarkMode)
    }

    useEffect(() => {
        document.documentElement.setAttribute("data-marathon", "")
        const root = document.documentElement
        root.style.setProperty("--font-geist-sans", "'Geist', sans-serif")
        root.style.setProperty("--font-fraktion", "'Fraktion', sans-serif")
        root.style.setProperty("--font-fraktion-mono", "'Fraktion Mono', monospace")
        root.style.setProperty("--font-mono", "'Fraktion Mono', monospace")
        root.style.setProperty("--font-interference", "'Interference', sans-serif")
        root.style.setProperty("--font-shapiro", "'Shapiro', sans-serif")
        root.style.setProperty("--font-shapiro-wide", "'Shapiro-Wide', sans-serif")
        toggleMode()
    }, [])

    return (
        <>
            <style>{fontFaces}</style>
            <button
                onClick={toggleMode}
                style={{
                    position: "fixed",
                    top: 10,
                    right: 10,
                    zIndex: 9999,
                    padding: "8px 12px",
                    backgroundColor: isDarkMode ? "#333" : "#fff",
                    color: isDarkMode ? "#fff" : "#333",
                    border: "none",
                    borderRadius: "5px",
                }}
            >
                {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <div data-marathon>
                <Story />
            </div>
        </>
    )
}

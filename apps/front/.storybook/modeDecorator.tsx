import React, { useEffect, useState } from "react";

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
`;

export const ModeDecorator = (Story: any) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle("dark", !isDarkMode);
    };

    useEffect(()=>{

        toggleMode()
    },[])

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
            <div
                data-marathon
                style={{
                    "--font-geist-sans": "'Geist', sans-serif",
                    "--font-fraktion": "'Fraktion', sans-serif",
                    "--font-fraktion-mono": "'Fraktion Mono', monospace",
                    "--font-interference": "'Interference', sans-serif",
                    "--font-shapiro": "'Shapiro', sans-serif",
                } as React.CSSProperties}
            >
                <Story />
            </div>
        </>
    );
};

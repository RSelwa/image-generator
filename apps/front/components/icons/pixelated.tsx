import { type ComponentProps } from "react"

export const PixelatedCheck = (props: ComponentProps<"svg">) => (
    <svg viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M2 5H1V4H2V5ZM1 4H0V3H1V4ZM3 4H2V3H3V4ZM4 3H3V2H4V3ZM5 2H4V1H5V2Z" fill="currentColor" />
    </svg>

)

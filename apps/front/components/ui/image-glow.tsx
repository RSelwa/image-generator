import { type CSSProperties, type ImgHTMLAttributes, type ReactElement, useState } from "react"
import * as React from "react"
import { cn } from "@/utils"

type ImageGlowProps = {
  children: ReactElement<ImgHTMLAttributes<HTMLImageElement>>
  radius?: number
  saturation?: number
  opacity?: number
  className?: string
  isBlurOnHover?: boolean
}

const blurStyle = (
  baseImage: string,
  radius: number,
  saturation: number,
  opacity: number
): CSSProperties => ({
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  pointerEvents: "none",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundImage: `url(${baseImage})`,
  filter: `blur(${radius}px) saturate(${saturation})`,
  opacity,
  zIndex: 0,
})

export const ImageGlow = ({
  children,
  radius = 50,
  saturation = 2,
  opacity = 1,
  className = "",
  isBlurOnHover = false,
}: ImageGlowProps) => {
  const [isHover, setIsHover] = useState(false)

  if (!React.isValidElement(children)) {
    console.error("ImageGlow requires a valid React element as its child.")

    return null
  }

  const { src, style: childStyle, className: childClassName } = children.props

  const baseImage = src ?? ""

  const glowStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    display: "block",
    width: "100%",
    height: "auto",
  }

  const styledImage = React.cloneElement(children, {
    style: { ...glowStyle, ...(childStyle || {}) },
    className: `${childClassName || ""} ${className}`.trim(),
  })

  if (typeof baseImage !== "string") return null

  return (
    <div className={cn("relative", className)} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
      {styledImage}
      <div style={blurStyle(baseImage, radius, saturation, isBlurOnHover ? isHover ? 1 : 0 : opacity)} />
    </div>

  )
}

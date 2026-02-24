"use client"

import { ImageIcon, XIcon } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import Loader from "@/components/icons/loader"
import { cn } from "@/utils"

interface ImageDropzoneProps {
  imageUrl: string | null
  onFileSelect: (file: File) => Promise<void>
  onRemove: () => void
  isUploading?: boolean
  alt?: string
  className?: string
}

export const ImageDropzone = ({
  imageUrl,
  onFileSelect,
  onRemove,
  isUploading = false,
  alt = "Uploaded image",
  className,
}: ImageDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")

      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    try {
      await onFileSelect(file)
    } catch {
      URL.revokeObjectURL(objectUrl)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    // First try to get file directly (works for local files)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await handleFile(file)

      return
    }

    // Try to get image from dataTransfer items (for images dragged from websites)
    const items = e.dataTransfer.items
    if (items) {
      for (const item of Array.from(items)) {
        // Check for image blob
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const blob = item.getAsFile()
          if (blob) {
            await handleFile(blob)

            return
          }
        }
      }
    }

    // Fallback: try to get URL and fetch the image
    const imageUrl = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain")
    if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
      try {
        const response = await fetch(imageUrl)
        if (!response.ok) throw new Error("Failed to fetch image")

        const blob = await response.blob()
        if (!blob.type.startsWith("image/")) {
          toast.error("URL does not point to an image")

          return
        }

        const filename = imageUrl.split("/").pop() || "image"
        const imageFile = new File([blob], filename, { type: blob.type })
        await handleFile(imageFile)
      } catch {
        toast.error("Could not fetch image from URL")
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await handleFile(file)
  }

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onRemove()
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const displayImage = previewUrl || imageUrl

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !displayImage && openFilePicker()}
        data-isDragging={isDragging}
        className={cn("relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden border-2 border-dashed transition-colors data-[isDragging=true]:border-primary data-[isDragging=true]:bg-primary/10 data-[isDragging=false]:border-border data-[isDragging=false]:bg-muted/30 data-[isDragging=false]:hover:border-primary/50 data-[isDragging=false]:hover:bg-muted/50", className)}
      >
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt={alt}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="bg-destructive text-destructive-foreground absolute top-2 right-2 rounded-full p-1"
            >
              <XIcon className="size-4" />
            </button>
          </>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center gap-2 p-4 text-center">
            <ImageIcon className="size-12 opacity-50" />
            <p className="text-sm">
              {isDragging ? "Drop image here" : "Drag & drop or click to upload"}
            </p>
          </div>
        )}
        {isUploading && (
          <div className="bg-background/80 absolute inset-0 flex items-center justify-center">
            <Loader className="size-8" />
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}

export type { ImageDropzoneProps }

import { StaticImageData } from "next/image"

export interface ImageZoomProps {
  src: string | StaticImageData
  alt?: string
  zoom?: number
  className?: string
}
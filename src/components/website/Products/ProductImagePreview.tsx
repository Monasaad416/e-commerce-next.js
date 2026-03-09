'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import FullImageSlider from './FullImageSlider'

export default function ProductImagePreview({ images = [] }: { images: string[] }) {
  const [isMounted, setIsMounted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !images.length) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-xl" />
    )
  }

  return (
    <>
      <div
        className="relative w-full h-[400px] cursor-zoom-in"
        onClick={() => setOpen(true)}
      >
        <Image
          src={images[0]}
          alt="Product"
          fill
          className="object-cover rounded-xl"
          unoptimized={process.env.NODE_ENV !== 'production'}
          priority
        />
      </div>

      {open && (
        <FullImageSlider 
          images={images} 
          onClose={() => setOpen(false)} 
        />
      )}
    </>
  )
}

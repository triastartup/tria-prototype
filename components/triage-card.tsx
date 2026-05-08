"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TriageCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  animateTitle?: boolean
}

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setDisplayedText("")
    setCurrentIndex(0)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  )
}

export function TriageCard({ children, className, title, animateTitle = false }: TriageCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {title && (
        <h2 className="text-3xl font-bold text-white text-center">
          {animateTitle ? <TypewriterText text={title} /> : title}
        </h2>
      )}
      <div
        className={cn(
          "bg-[#fefefe] border-2 border-[#c8516d] rounded-xl p-8 w-full shadow-lg shadow-black/20",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

"use client"
import { createContext, useContext, useEffect, useMemo, useRef, ReactNode } from "react"
import { AudioPlayer } from "../utils/audio.utils"
import { AudioConfig } from "../config/audio.config"

interface AudioContextValue {
  playBubble: () => void
  playTick: () => void
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined)

export function AudioProvider({ children }: Readonly<{ children: ReactNode }>) {
  const bubbleRef = useRef<AudioPlayer | null>(null)
  const tickRef = useRef<AudioPlayer | null>(null)

  useEffect(() => {
    bubbleRef.current = new AudioPlayer(AudioConfig.BUBBLE ?? "")
    tickRef.current = new AudioPlayer(AudioConfig.TICK_DONE ?? "")
    return () => {
      bubbleRef.current?.stop()
      tickRef.current?.stop()
      bubbleRef.current = null
      tickRef.current = null
    }
  }, [])

  const value = useMemo<AudioContextValue>(
    () => ({
      playBubble: () => { bubbleRef.current?.play() },
      playTick: () => { tickRef.current?.play() },
    }),
    [],
  )

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) throw new Error("useAudio phải được dùng bên trong AudioProvider")
  return context
}
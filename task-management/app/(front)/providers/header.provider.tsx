"use client"
import { createContext, useContext, useState, ReactNode, useCallback } from "react"
interface HeaderContextValue {
  title: string
  setTitle: (title: string) => void
}

const HeaderContext = createContext<HeaderContextValue | undefined>(undefined)

export function HeaderProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [title, setTitleState] = useState("Inbox")

  const setTitle = useCallback((newTitle: string) => {
    setTitleState(newTitle)
  }, [])

  return (
    <HeaderContext.Provider value={{ title, setTitle }}>
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeader() {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error("useHeader phải được dùng bên trong HeaderProvider")
  }
  return context
}
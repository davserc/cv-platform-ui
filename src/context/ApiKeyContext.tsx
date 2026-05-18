import { createContext, useContext, useState } from 'react'

export const API_KEY_STORAGE_KEY = 'cv_api_key'

interface ApiKeyContextValue {
  apiKey: string
  setApiKey: (key: string) => void
}

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null)

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState(
    () => localStorage.getItem(API_KEY_STORAGE_KEY) ?? '',
  )

  const setApiKey = (key: string) => {
    const trimmed = key.trim()
    if (trimmed) localStorage.setItem(API_KEY_STORAGE_KEY, trimmed)
    else localStorage.removeItem(API_KEY_STORAGE_KEY)
    setApiKeyState(trimmed)
  }

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext)
  if (!ctx) throw new Error('useApiKey must be used within ApiKeyProvider')
  return ctx
}

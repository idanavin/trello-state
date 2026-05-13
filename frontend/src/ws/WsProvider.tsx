import { createContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { createWsClient, type WsClient } from './wsClient'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001'

// ---------------------------------------------------------------------------
// Context
// Exported so useWsClient can read it. Do not consume directly — use the hook.
// ---------------------------------------------------------------------------

export const WsContext = createContext<WsClient | null>(null)

// ---------------------------------------------------------------------------
// Provider
// Mount once at the App root. Creates exactly one WebSocket connection for the
// entire component tree. Both board instances in Compare mode share this socket.
// ---------------------------------------------------------------------------

interface WsProviderProps {
  children: ReactNode
}

export function WsProvider({ children }: WsProviderProps) {
  // useState initializer runs once — ensures one socket even under StrictMode
  // double-invoke (the first client is replaced but only one is ever exposed).
  const [client] = useState<WsClient>(() => createWsClient(WS_URL))
  const pendingCloseTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    // React StrictMode in development runs effect cleanup immediately after mount.
    // Defer closing and cancel on immediate remount so we don't kill the live client.
    if (pendingCloseTimeoutRef.current !== null) {
      window.clearTimeout(pendingCloseTimeoutRef.current)
      pendingCloseTimeoutRef.current = null
    }

    return () => {
      pendingCloseTimeoutRef.current = window.setTimeout(() => {
        client.close()
        pendingCloseTimeoutRef.current = null
      }, 0)
    }
  }, [client])

  return <WsContext.Provider value={client}>{children}</WsContext.Provider>
}

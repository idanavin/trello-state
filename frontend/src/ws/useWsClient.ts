import { useContext } from 'react'
import { WsContext } from './WsProvider'
import type { WsClient } from './wsClient'

// ---------------------------------------------------------------------------
// useWsClient
//
// The public interface for all state implementations.
// Returns the shared WsClient — { send, on } — never the raw WebSocket.
//
// Usage in a state impl:
//   const wsClient = useWsClient()
//   useEffect(() => wsClient.on(ServerEventType.CardCreated, handler), [wsClient])
// ---------------------------------------------------------------------------

export function useWsClient(): WsClient {
  const client = useContext(WsContext)
  if (client === null) {
    throw new Error('useWsClient must be used inside <WsProvider>')
  }
  return client
}

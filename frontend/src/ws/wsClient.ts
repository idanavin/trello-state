import type { ClientMessage, ServerMessage } from './types'

// ---------------------------------------------------------------------------
// WsClient contract
// This is the abstract interface every state implementation depends on.
// ---------------------------------------------------------------------------

export interface WsClient {
  /** Send a typed message to the server. No-ops if the socket is not open. */
  send: (message: ClientMessage) => void

  /**
   * Subscribe to a specific server event type.
   * Returns an unsubscribe function — call it (or return it from useEffect) to clean up.
   *
   * @example
   * useEffect(() => {
   *   return wsClient.on(ServerEventType.CardCreated, (msg) => { ... })
   * }, [wsClient])
   */
  on: <T extends ServerMessage>(
    eventType: T['type'],
    handler: (message: T) => void
  ) => () => void

  /** Close the underlying socket. Called by WsProvider on unmount. */
  close: () => void
}

// ---------------------------------------------------------------------------
// Factory — creates one WsClient bound to one WebSocket connection.
// Not a React hook; lives outside the component tree.
// ---------------------------------------------------------------------------

export function createWsClient(url: string): WsClient {
  const socket = new WebSocket(url)
  const listeners = new Map<string, Set<(msg: ServerMessage) => void>>()

  socket.onmessage = (event: MessageEvent<string>) => {
    let message: ServerMessage
    try {
      message = JSON.parse(event.data) as ServerMessage
    } catch {
      console.warn('[WsClient] Discarded malformed message', event.data)
      return
    }

    listeners.get(message.type)?.forEach((handler) => handler(message))
  }

  function send(message: ClientMessage): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    }
  }

  function on<T extends ServerMessage>(
    eventType: T['type'],
    handler: (message: T) => void
  ): () => void {
    if (!listeners.has(eventType)) {
      listeners.set(eventType, new Set())
    }
    const set = listeners.get(eventType)!
    // Cast: the Set is keyed by event type, so the handler type is correct.
    const castHandler = handler as (msg: ServerMessage) => void
    set.add(castHandler)
    return () => set.delete(castHandler)
  }

  function close(): void {
    socket.close()
  }

  return { send, on, close }
}

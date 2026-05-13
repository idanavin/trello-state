import { useState, useEffect, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider, useQueryClient, useQuery } from '@tanstack/react-query'
import { BoardContext, type BoardContextValue } from '../../board/BoardContext'
import { useWsClient } from '../../ws/useWsClient'
import { ClientEventType, ServerEventType } from '../../ws/types'
import type {
  BoardInitMessage,
  CardCreatedMessage,
  CardUpdatedMessage,
  CardMovedMessage,
  CardDeletedMessage,
  PresenceUpdateMessage,
} from '../../ws/types'
import type { Card, CardFormValues, ColumnId } from '../../types'
import { getUserName } from '../../utils'

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const QUERY_KEYS = {
  cards: ['board', 'cards'] as const,
  users: ['board', 'users'] as const,
}

// ---------------------------------------------------------------------------
// BoardContextBridge — subscribes to WS events and keeps query cache in sync.
// Bridges the TanStack Query cache into BoardContext.
// ---------------------------------------------------------------------------

function BoardContextBridge({ children }: { children: ReactNode }) {
  const wsClient = useWsClient()
  const queryClient = useQueryClient()

  // useQuery subscribes to the cache key and re-renders automatically when
  // setQueryData is called — this is the correct reactive primitive.
  const { data: cards = [] } = useQuery<Card[]>({
    queryKey: QUERY_KEYS.cards,
    queryFn: () => [],   // board state is WS-driven, never fetched over HTTP
    initialData: [],
    staleTime: Infinity,
    enabled: false,      // never auto-fetch
  })

  const { data: connectedUsers = [] } = useQuery<string[]>({
    queryKey: QUERY_KEYS.users,
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
    enabled: false,
  })

  const [pendingCreates] = useState<Map<string, string>>(() => new Map())

  useEffect(() => {
    const userName = getUserName()

    const unsubs = [
      wsClient.on<BoardInitMessage>(ServerEventType.BoardInit, (msg) => {
        queryClient.setQueryData<Card[]>(QUERY_KEYS.cards, msg.cards)
        queryClient.setQueryData<string[]>(QUERY_KEYS.users, msg.users)
      }),

      wsClient.on<CardCreatedMessage>(ServerEventType.CardCreated, (msg) => {
        // Find a pending optimistic card by title+columnId key
        let matchedTempId: string | undefined
        for (const [tempId, key] of pendingCreates.entries()) {
          if (key === `${msg.card.title}::${msg.card.columnId}`) {
            matchedTempId = tempId
            break
          }
        }

        queryClient.setQueryData<Card[]>(QUERY_KEYS.cards, (prev = []) => {
          if (matchedTempId !== undefined) {
            pendingCreates.delete(matchedTempId)
            // Replace the optimistic card with the real one from the server
            return prev.map((c) => (c.id === matchedTempId ? msg.card : c))
          }
          // Card from another client — append if not already present
          return prev.some((c) => c.id === msg.card.id) ? prev : [...prev, msg.card]
        })
      }),

      wsClient.on<CardUpdatedMessage>(ServerEventType.CardUpdated, (msg) => {
        queryClient.setQueryData<Card[]>(QUERY_KEYS.cards, (prev = []) =>
          prev.map((c) => (c.id === msg.card.id ? msg.card : c)),
        )
      }),

      wsClient.on<CardMovedMessage>(ServerEventType.CardMoved, (msg) => {
        queryClient.setQueryData<Card[]>(QUERY_KEYS.cards, (prev = []) =>
          prev.map((c) => (c.id === msg.id ? { ...c, columnId: msg.columnId } : c)),
        )
      }),

      wsClient.on<CardDeletedMessage>(ServerEventType.CardDeleted, (msg) => {
        queryClient.setQueryData<Card[]>(QUERY_KEYS.cards, (prev = []) =>
          prev.filter((c) => c.id !== msg.id),
        )
      }),

      wsClient.on<PresenceUpdateMessage>(ServerEventType.PresenceUpdate, (msg) => {
        queryClient.setQueryData<string[]>(QUERY_KEYS.users, msg.users)
      }),
    ]

    wsClient.send({ type: ClientEventType.UserJoin, userName })

    return () => {
      unsubs.forEach((unsub) => unsub())
    }
  }, [wsClient, queryClient, pendingCreates])

  const value: BoardContextValue = {
    cards,
    connectedUsers,

    addCard(columnId: ColumnId, values: CardFormValues) {
      const tempId = `temp-${crypto.randomUUID()}`
      pendingCreates.set(tempId, `${values.title}::${columnId}`)
      // Optimistic: add immediately to the cache
      queryClient.setQueryData<Card[]>(QUERY_KEYS.cards, (prev = []) => [
        ...prev,
        { id: tempId, columnId, ...values },
      ])
      wsClient.send({ type: ClientEventType.CardCreate, columnId, ...values })
    },

    editCard(cardId: string, values: CardFormValues) {
      // Optimistic: patch fields in the cache
      queryClient.setQueryData<Card[]>(QUERY_KEYS.cards, (prev = []) =>
        prev.map((c) => (c.id === cardId ? { ...c, ...values } : c)),
      )
      wsClient.send({ type: ClientEventType.CardUpdate, id: cardId, ...values })
    },

    deleteCard(cardId: string) {
      queryClient.setQueryData<Card[]>(QUERY_KEYS.cards, (prev = []) =>
        prev.filter((c) => c.id !== cardId),
      )
      wsClient.send({ type: ClientEventType.CardDelete, id: cardId })
    },

    moveCard(cardId: string, toColumn: ColumnId) {
      queryClient.setQueryData<Card[]>(QUERY_KEYS.cards, (prev = []) =>
        prev.map((c) => (c.id === cardId ? { ...c, columnId: toColumn } : c)),
      )
      wsClient.send({ type: ClientEventType.CardMove, id: cardId, columnId: toColumn })
    },
  }

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}

// ---------------------------------------------------------------------------
// BoardProvider — exported; creates a fresh QueryClient per instance so that
// Compare mode can run two independent TanStack caches side by side.
// ---------------------------------------------------------------------------

export function BoardProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Board state is entirely WS-driven — never auto-refetch
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <BoardContextBridge>{children}</BoardContextBridge>
    </QueryClientProvider>
  )
}

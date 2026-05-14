import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
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
import type { CardFormValues, ColumnId } from '../../types'
import { createBoardStore, type ZustandBoardStore } from './store'
import { getUserName } from '../../utils'
import { recordRender, recordAction, recordWsEvent, recordRoundTrip } from '../../metrics/metricsStore'

const IMPL_KEY = 'zustand'

// ---------------------------------------------------------------------------
// StoreContext — passes the store instance through the tree
// (avoids module-level singleton; enables two stores in Compare mode)
// ---------------------------------------------------------------------------

const StoreContext = createContext<ZustandBoardStore | null>(null)

function useBoardStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useBoardStore must be inside BoardProvider')
  return store
}

// ---------------------------------------------------------------------------
// BoardContextBridge — reads from the Zustand store and bridges to BoardContext.
// Owns the WS subscription lifecycle.
// ---------------------------------------------------------------------------

function BoardContextBridge({ children }: { children: ReactNode }) {
  useEffect(() => { recordRender(IMPL_KEY) })

  const wsClient = useWsClient()
  const store = useBoardStore()

  const cards = useStore(store, useShallow((s) => s.cards))
  const connectedUsers = useStore(store, useShallow((s) => s.connectedUsers))

  const [pendingCreates] = useState<Map<string, string>>(() => new Map())
  const lastActionTs = useRef<number | null>(null)

  useEffect(() => {
    const userName = getUserName()

    const unsubs = [
      wsClient.on<BoardInitMessage>(ServerEventType.BoardInit, (msg) => {
        recordWsEvent(IMPL_KEY)
        store.getState().setBoard(msg.cards, msg.users)
      }),
      wsClient.on<CardCreatedMessage>(ServerEventType.CardCreated, (msg) => {
        let matchedTempId: string | undefined
        for (const [tempId, key] of pendingCreates.entries()) {
          if (key === `${msg.card.title}::${msg.card.columnId}`) {
            matchedTempId = tempId
            break
          }
        }
        const isEcho = matchedTempId !== undefined
        recordWsEvent(IMPL_KEY, isEcho)
        if (isEcho) {
          if (lastActionTs.current !== null) {
            recordRoundTrip(IMPL_KEY, Date.now() - lastActionTs.current)
            lastActionTs.current = null
          }
          pendingCreates.delete(matchedTempId!)
          store.getState().reconcileCreate(matchedTempId!, msg.card)
        } else {
          store.getState().upsertCard(msg.card)
        }
      }),
      wsClient.on<CardUpdatedMessage>(ServerEventType.CardUpdated, (msg) => {
        recordWsEvent(IMPL_KEY)
        if (lastActionTs.current !== null) {
          recordRoundTrip(IMPL_KEY, Date.now() - lastActionTs.current)
          lastActionTs.current = null
        }
        store.getState().upsertCard(msg.card)
      }),
      wsClient.on<CardMovedMessage>(ServerEventType.CardMoved, (msg) => {
        recordWsEvent(IMPL_KEY)
        if (lastActionTs.current !== null) {
          recordRoundTrip(IMPL_KEY, Date.now() - lastActionTs.current)
          lastActionTs.current = null
        }
        store.getState().moveCard(msg.id, msg.columnId)
      }),
      wsClient.on<CardDeletedMessage>(ServerEventType.CardDeleted, (msg) => {
        recordWsEvent(IMPL_KEY)
        if (lastActionTs.current !== null) {
          recordRoundTrip(IMPL_KEY, Date.now() - lastActionTs.current)
          lastActionTs.current = null
        }
        store.getState().deleteCard(msg.id)
      }),
      wsClient.on<PresenceUpdateMessage>(ServerEventType.PresenceUpdate, (msg) => {
        recordWsEvent(IMPL_KEY)
        store.getState().setPresence(msg.users)
      }),
    ]

    wsClient.send({ type: ClientEventType.UserJoin, userName })

    return () => unsubs.forEach((unsub) => unsub())
  }, [wsClient, store, pendingCreates])

  const value: BoardContextValue = {
    cards,
    connectedUsers,

    addCard(columnId: ColumnId, values: CardFormValues) {
      recordAction(IMPL_KEY)
      lastActionTs.current = Date.now()
      const tempId = `temp-${crypto.randomUUID()}`
      pendingCreates.set(tempId, `${values.title}::${columnId}`)
      store.getState().upsertCard({ id: tempId, columnId, ...values })
      wsClient.send({ type: ClientEventType.CardCreate, columnId, ...values })
    },

    editCard(cardId: string, values: CardFormValues) {
      recordAction(IMPL_KEY)
      lastActionTs.current = Date.now()
      const existing = store.getState().cards.find((c) => c.id === cardId)
      store.getState().upsertCard({
        id: cardId,
        columnId: existing?.columnId ?? 'todo',
        ...values,
      })
      wsClient.send({ type: ClientEventType.CardUpdate, id: cardId, ...values })
    },

    deleteCard(cardId: string) {
      recordAction(IMPL_KEY)
      lastActionTs.current = Date.now()
      store.getState().deleteCard(cardId)
      wsClient.send({ type: ClientEventType.CardDelete, id: cardId })
    },

    moveCard(cardId: string, toColumn: ColumnId) {
      recordAction(IMPL_KEY)
      lastActionTs.current = Date.now()
      store.getState().moveCard(cardId, toColumn)
      wsClient.send({ type: ClientEventType.CardMove, id: cardId, columnId: toColumn })
    },
  }

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}

// ---------------------------------------------------------------------------
// BoardProvider — exported; creates a fresh Zustand store per instance.
// ---------------------------------------------------------------------------

export function BoardProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createBoardStore(`trello-zustand-board-${crypto.randomUUID()}`))

  return (
    <StoreContext.Provider value={store}>
      <BoardContextBridge>{children}</BoardContextBridge>
    </StoreContext.Provider>
  )
}

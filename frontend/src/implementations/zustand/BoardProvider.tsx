import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
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
  const wsClient = useWsClient()
  const store = useBoardStore()

  const cards = useStore(store, useShallow((s) => s.cards))
  const connectedUsers = useStore(store, useShallow((s) => s.connectedUsers))

  const [pendingCreates] = useState<Map<string, string>>(() => new Map())

  useEffect(() => {
    const userName = getUserName()

    const unsubs = [
      wsClient.on<BoardInitMessage>(ServerEventType.BoardInit, (msg) => {
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
        if (matchedTempId !== undefined) {
          pendingCreates.delete(matchedTempId)
          store.getState().reconcileCreate(matchedTempId, msg.card)
        } else {
          store.getState().upsertCard(msg.card)
        }
      }),
      wsClient.on<CardUpdatedMessage>(ServerEventType.CardUpdated, (msg) => {
        store.getState().upsertCard(msg.card)
      }),
      wsClient.on<CardMovedMessage>(ServerEventType.CardMoved, (msg) => {
        store.getState().moveCard(msg.id, msg.columnId)
      }),
      wsClient.on<CardDeletedMessage>(ServerEventType.CardDeleted, (msg) => {
        store.getState().deleteCard(msg.id)
      }),
      wsClient.on<PresenceUpdateMessage>(ServerEventType.PresenceUpdate, (msg) => {
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
      const tempId = `temp-${crypto.randomUUID()}`
      pendingCreates.set(tempId, `${values.title}::${columnId}`)
      store.getState().upsertCard({ id: tempId, columnId, ...values })
      wsClient.send({ type: ClientEventType.CardCreate, columnId, ...values })
    },

    editCard(cardId: string, values: CardFormValues) {
      const existing = store.getState().cards.find((c) => c.id === cardId)
      store.getState().upsertCard({
        id: cardId,
        columnId: existing?.columnId ?? 'todo',
        ...values,
      })
      wsClient.send({ type: ClientEventType.CardUpdate, id: cardId, ...values })
    },

    deleteCard(cardId: string) {
      store.getState().deleteCard(cardId)
      wsClient.send({ type: ClientEventType.CardDelete, id: cardId })
    },

    moveCard(cardId: string, toColumn: ColumnId) {
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

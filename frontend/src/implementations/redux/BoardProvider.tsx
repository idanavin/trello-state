import { useState, useEffect, type ReactNode } from 'react'
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux'
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
import {
  setBoard,
  setPresence,
  addCard,
  updateCard,
  moveCard,
  deleteCard,
  reconcileAddCard,
  selectCards,
  selectConnectedUsers,
  type RootState,
} from './slice'
import { createBoardStore, type AppDispatch } from './store'
import { getUserName } from '../../utils'

// ---------------------------------------------------------------------------
// BoardContextBridge — sits inside the Redux Provider; reads from Redux and
// bridges into BoardContext. Owns the WS subscription lifecycle.
// ---------------------------------------------------------------------------

function BoardContextBridge({ children }: { children: ReactNode }) {
  const wsClient = useWsClient()
  const dispatch = useDispatch<AppDispatch>()
  const cards = useSelector((state: RootState) => selectCards(state))
  const connectedUsers = useSelector((state: RootState) => selectConnectedUsers(state))

  // Track pending temp IDs so we can reconcile when the server echoes back
  const [pendingCreates] = useState<Map<string, string>>(() => new Map())

  useEffect(() => {
    const userName = getUserName()

    const unsubs = [
      wsClient.on<BoardInitMessage>(ServerEventType.BoardInit, (msg) => {
        dispatch(setBoard({ cards: msg.cards, users: msg.users }))
      }),
      wsClient.on<CardCreatedMessage>(ServerEventType.CardCreated, (msg) => {
        // Find a temp card that matches this server card by title + columnId
        let matchedTempId: string | undefined
        for (const [tempId, key] of pendingCreates.entries()) {
          if (key === `${msg.card.title}::${msg.card.columnId}`) {
            matchedTempId = tempId
            break
          }
        }
        if (matchedTempId !== undefined) {
          pendingCreates.delete(matchedTempId)
          dispatch(reconcileAddCard({ tempId: matchedTempId, real: msg.card }))
        } else {
          dispatch(addCard(msg.card))
        }
      }),
      wsClient.on<CardUpdatedMessage>(ServerEventType.CardUpdated, (msg) => {
        dispatch(updateCard(msg.card))
      }),
      wsClient.on<CardMovedMessage>(ServerEventType.CardMoved, (msg) => {
        dispatch(moveCard({ id: msg.id, columnId: msg.columnId }))
      }),
      wsClient.on<CardDeletedMessage>(ServerEventType.CardDeleted, (msg) => {
        dispatch(deleteCard(msg.id))
      }),
      wsClient.on<PresenceUpdateMessage>(ServerEventType.PresenceUpdate, (msg) => {
        dispatch(setPresence(msg.users))
      }),
    ]

    wsClient.send({ type: ClientEventType.UserJoin, userName })

    return () => unsubs.forEach((unsub) => unsub())
  }, [wsClient, dispatch, pendingCreates])

  const value: BoardContextValue = {
    cards,
    connectedUsers,

    addCard(columnId: ColumnId, values: CardFormValues) {
      const tempId = `temp-${crypto.randomUUID()}`
      pendingCreates.set(tempId, `${values.title}::${columnId}`)
      dispatch(addCard({ id: tempId, columnId, ...values }))
      wsClient.send({ type: ClientEventType.CardCreate, columnId, ...values })
    },

    editCard(cardId: string, values: CardFormValues) {
      // Optimistic: update fields locally; server will echo card:updated
      dispatch(
        updateCard({
          id: cardId,
          columnId: cards.find((c) => c.id === cardId)?.columnId ?? 'todo',
          ...values,
        }),
      )
      wsClient.send({ type: ClientEventType.CardUpdate, id: cardId, ...values })
    },

    deleteCard(cardId: string) {
      dispatch(deleteCard(cardId))
      wsClient.send({ type: ClientEventType.CardDelete, id: cardId })
    },

    moveCard(cardId: string, toColumn: ColumnId) {
      dispatch(moveCard({ id: cardId, columnId: toColumn }))
      wsClient.send({ type: ClientEventType.CardMove, id: cardId, columnId: toColumn })
    },
  }

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}

// ---------------------------------------------------------------------------
// BoardProvider — exported; creates a fresh Redux store per instance.
// Wraps children in Redux <Provider> + <BoardContextBridge>.
// ---------------------------------------------------------------------------

export function BoardProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createBoardStore())

  return (
    <ReduxProvider store={store}>
      <BoardContextBridge>{children}</BoardContextBridge>
    </ReduxProvider>
  )
}

// ---------------------------------------------------------------------------
// metricsStore — module-level singleton shared across all BoardProvider
// instances. Each implementation writes its own scoped counters.
// The stats bar reads from this store via a subscription.
// ---------------------------------------------------------------------------

import type { ImplKey } from '../board/implRegistry'

export interface ImplMetrics {
  renderCount: number
  actionCount: number
  cacheHits: number        // TanStack: setQueryData calls that found an existing entry
  wsEventCount: number     // incoming WS events processed
  lastActionMs: number | null  // ms elapsed for last optimistic → WS echo round-trip
}

type Listener = () => void

const DEFAULT_METRICS: ImplMetrics = {
  renderCount: 0,
  actionCount: 0,
  cacheHits: 0,
  wsEventCount: 0,
  lastActionMs: null,
}

// Mutable state
const state: Record<string, ImplMetrics> = {}
const listeners = new Set<Listener>()

function getOrCreate(impl: string): ImplMetrics {
  if (!state[impl]) state[impl] = { ...DEFAULT_METRICS }
  return state[impl]
}

function notify() {
  listeners.forEach((l) => l())
}

// ---------------------------------------------------------------------------
// Write API — called from BoardProviders
// ---------------------------------------------------------------------------

export function recordRender(impl: string) {
  const m = getOrCreate(impl)
  state[impl] = { ...m, renderCount: m.renderCount + 1 }
  notify()
}

export function recordAction(impl: string) {
  const m = getOrCreate(impl)
  state[impl] = { ...m, actionCount: m.actionCount + 1, lastActionMs: null }
  notify()
}

export function recordWsEvent(impl: string, isEcho = false) {
  const m = getOrCreate(impl)
  state[impl] = {
    ...m,
    wsEventCount: m.wsEventCount + 1,
    cacheHits: isEcho ? m.cacheHits + 1 : m.cacheHits,
  }
  notify()
}

export function recordRoundTrip(impl: string, ms: number) {
  state[impl] = { ...getOrCreate(impl), lastActionMs: ms }
  notify()
}

export function resetMetrics(impl: string) {
  state[impl] = { ...DEFAULT_METRICS }
  notify()
}

// ---------------------------------------------------------------------------
// Read API — called from StatsBar
// ---------------------------------------------------------------------------

export function getMetrics(impl: string): ImplMetrics {
  return { ...getOrCreate(impl) }  // always return a fresh copy
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

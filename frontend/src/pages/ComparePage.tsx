import { Suspense } from 'react'
import { IMPL_REGISTRY } from '../board/implRegistry'
import { BoardPage } from '../board/BoardPage'
import { ImplStatsBar } from '../components/ImplStatsBar'

// ---------------------------------------------------------------------------
// ComparePage — renders all three implementations side by side with per-impl
// metrics bars showing render counts, action counts, WS events, cache hits,
// and round-trip latency.
// ---------------------------------------------------------------------------

const PANES = [
  { key: 'redux',    label: 'Redux Toolkit' },
  { key: 'zustand',  label: 'Zustand' },
  { key: 'tanstack', label: 'TanStack Query' },
] as const

export function ComparePage() {
  return (
    <div className="page-compare">
      {PANES.map((pane, index) => {
        const Provider = IMPL_REGISTRY[pane.key]
        return (
          <div key={pane.key} className="compare-pane">
            {index > 0 && <div className="compare-divider" />}
            <div className="compare-pane-inner">
              <div className="compare-pane-label">{pane.label}</div>
              <Suspense fallback={<div className="loading">Loading…</div>}>
                <Provider>
                  <BoardPage />
                </Provider>
              </Suspense>
              <ImplStatsBar impl={pane.key} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

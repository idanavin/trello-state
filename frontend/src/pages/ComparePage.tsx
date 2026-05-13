import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IMPL_REGISTRY, DEFAULT_IMPL, type ImplKey } from '../board/implRegistry'
import { BoardPage } from '../board/BoardPage'

// ---------------------------------------------------------------------------
// ComparePage — renders two BoardProvider trees side by side.
// Use ?implA=redux&implB=zustand to control which implementations are shown.
// ---------------------------------------------------------------------------

export function ComparePage() {
  const [searchParams] = useSearchParams()
  const implA = (searchParams.get('implA') ?? DEFAULT_IMPL) as ImplKey
  const implB = (searchParams.get('implB') ?? 'zustand') as ImplKey

  const ProviderA = IMPL_REGISTRY[implA] ?? IMPL_REGISTRY[DEFAULT_IMPL]
  const ProviderB = IMPL_REGISTRY[implB] ?? IMPL_REGISTRY[DEFAULT_IMPL]

  return (
    <div className="page-compare">
      <div className="compare-pane">
        <div className="compare-pane-label">{implA}</div>
        <Suspense fallback={<div className="loading">Loading…</div>}>
          <ProviderA>
            <BoardPage />
          </ProviderA>
        </Suspense>
      </div>
      <div className="compare-divider" />
      <div className="compare-pane">
        <div className="compare-pane-label">{implB}</div>
        <Suspense fallback={<div className="loading">Loading…</div>}>
          <ProviderB>
            <BoardPage />
          </ProviderB>
        </Suspense>
      </div>
    </div>
  )
}

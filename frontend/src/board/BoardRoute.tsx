import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IMPL_REGISTRY, DEFAULT_IMPL, type ImplKey } from './implRegistry'
import { BoardPage } from './BoardPage'

const IMPL_ORDER = Object.keys(IMPL_REGISTRY) as ImplKey[]

export function BoardRoute() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedImpl = searchParams.get('impl')
  const implKey =
    requestedImpl && requestedImpl in IMPL_REGISTRY
      ? (requestedImpl as ImplKey)
      : DEFAULT_IMPL
  const BoardProvider = IMPL_REGISTRY[implKey] ?? IMPL_REGISTRY[DEFAULT_IMPL]

  function switchImpl(target: ImplKey) {
    const nextParams = new URLSearchParams(searchParams)
    if (target === DEFAULT_IMPL) {
      nextParams.delete('impl')
    } else {
      nextParams.set('impl', target)
    }
    setSearchParams(nextParams)
  }

  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <BoardProvider>
        <div className="page-single">
          <div className="single-toolbar">
            <span className="toolbar-label">State implementation:</span>
            <div className="impl-switcher">
              {IMPL_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`btn-impl${key === implKey ? ' btn-impl--active' : ''}`}
                  onClick={() => switchImpl(key)}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          <BoardPage />
        </div>
      </BoardProvider>
    </Suspense>
  )
}

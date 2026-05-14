import { useState, useEffect, useCallback } from 'react'
import { getMetrics, subscribe, resetMetrics } from '../metrics/metricsStore'
import type { ImplKey } from '../board/implRegistry'

// ---------------------------------------------------------------------------
// Static profile per implementation — strengths, weaknesses, philosophy tag
// ---------------------------------------------------------------------------

interface ImplProfile {
  label: string
  philosophy: string
  color: string
  strengths: string[]
  weaknesses: string[]
  cacheHitLabel: string
}

const PROFILES: Record<ImplKey, ImplProfile> = {
  redux: {
    label: 'Redux Toolkit',
    philosophy: 'Centralized Flux',
    color: '#764abc',
    strengths: [
      'Single source of truth',
      'Time-travel debugging',
      'Predictable state transitions',
      'Fine-grained Reselect memoization',
    ],
    weaknesses: [
      'Most boilerplate of the three',
      'Indirection: action → reducer → selector',
      'Heavier bundle (+RTK + Reselect)',
    ],
    cacheHitLabel: 'Reconciled creates',
  },
  zustand: {
    label: 'Zustand',
    philosophy: 'Lightweight Store',
    color: '#f97316',
    strengths: [
      'Minimal boilerplate',
      'Direct mutation via Immer',
      'No Provider wrapping needed (singleton)',
      'useShallow for cheap slice subscriptions',
    ],
    weaknesses: [
      'No built-in action history',
      'Looser conventions — discipline required',
      'Singleton default is awkward for multi-instance',
    ],
    cacheHitLabel: 'Reconciled creates',
  },
  tanstack: {
    label: 'TanStack Query',
    philosophy: 'Server-State Cache',
    color: '#ef4444',
    strengths: [
      'Purpose-built for server-state lifecycle',
      'setQueryData = instant optimistic cache write',
      'Stale/fresh awareness (auto-refetch hooks)',
      'QueryClient isolated per instance',
    ],
    weaknesses: [
      'WS-only boards fight the fetch-first model',
      'No reducer pattern — harder to trace mutations',
      'Cache hit metric requires manual instrumentation',
    ],
    cacheHitLabel: 'Reconciled creates',
  },
}

// ---------------------------------------------------------------------------
// useMetrics — subscribes to metricsStore; stores a snapshot in local state
// so React Compiler sees a genuine state change (new object) on every update.
// ---------------------------------------------------------------------------

function useMetrics(impl: ImplKey) {
  const [snapshot, setSnapshot] = useState(() => getMetrics(impl))
  useEffect(() => {
    // Sync immediately in case metrics changed between render and effect
    setSnapshot(getMetrics(impl))
    return subscribe(() => setSnapshot(getMetrics(impl)))
  }, [impl])
  return snapshot
}

// ---------------------------------------------------------------------------
// ImplStatsBar — rendered below each board pane in Compare mode
// ---------------------------------------------------------------------------

interface ImplStatsBarProps {
  impl: ImplKey
}

export function ImplStatsBar({ impl }: ImplStatsBarProps) {
  const metrics = useMetrics(impl)
  const profile = PROFILES[impl]

  const handleReset = useCallback(() => resetMetrics(impl), [impl])

  return (
    <div className="stats-bar" style={{ '--impl-color': profile.color } as React.CSSProperties}>
      <div className="stats-bar-header">
        <span className="stats-philosophy">{profile.philosophy}</span>
        <div className="stats-bar-actions">
          <button className="btn-reset-metrics" onClick={handleReset} title="Reset counters">
            ↺
          </button>
        </div>
      </div>

      <div className="stats-counters">
        <StatCell label="Renders" value={metrics.renderCount} highlight={metrics.renderCount > 20} />
        <StatCell label="Actions" value={metrics.actionCount} />
        <StatCell label="WS events" value={metrics.wsEventCount} />
        <StatCell label={profile.cacheHitLabel} value={metrics.cacheHits} positive />
        <StatCell
          label="Last round-trip"
          value={metrics.lastActionMs !== null ? `${metrics.lastActionMs}ms` : '—'}
        />
      </div>

      <div className="stats-profile">
        <div className="stats-profile-col">
          <div className="stats-profile-heading strengths-heading">Strengths</div>
          <ul className="stats-profile-list">
            {profile.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="stats-profile-col">
          <div className="stats-profile-heading weaknesses-heading">Trade-offs</div>
          <ul className="stats-profile-list">
            {profile.weaknesses.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StatCell — single metric tile
// ---------------------------------------------------------------------------

interface StatCellProps {
  label: string
  value: number | string
  highlight?: boolean
  positive?: boolean
}

function StatCell({ label, value, highlight, positive }: StatCellProps) {
  return (
    <div className={`stat-cell${highlight ? ' stat-cell--warn' : ''}${positive ? ' stat-cell--positive' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

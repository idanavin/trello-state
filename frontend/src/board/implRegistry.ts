import { lazy } from 'react'

export const IMPL_REGISTRY = {
  redux:    lazy(() => import('../implementations/redux/BoardProvider').then(m => ({ default: m.BoardProvider }))),
  zustand:  lazy(() => import('../implementations/zustand/BoardProvider').then(m => ({ default: m.BoardProvider }))),
  tanstack: lazy(() => import('../implementations/tanstack/BoardProvider').then(m => ({ default: m.BoardProvider }))),
} as const

export type ImplKey = keyof typeof IMPL_REGISTRY

export const DEFAULT_IMPL: ImplKey = 'redux'

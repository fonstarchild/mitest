import { useState, useCallback } from 'react'
import type { SortField, SortState } from '@/types'

export function useSortState(initial?: SortState) {
  const [sort, setSort] = useState<SortState | null>(initial ?? null)

  const toggle = useCallback((field: SortField) => {
    setSort((prev) => {
      if (prev?.field !== field) return { field, direction: 'asc' }
      if (prev.direction === 'asc') return { field, direction: 'desc' }
      return null
    })
  }, [])

  return { sort, toggle } as const
}

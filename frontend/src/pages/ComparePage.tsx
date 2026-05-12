import { BoardInstance } from '../components/BoardInstance'

export function ComparePage() {
  return (
    <div className="page-compare">
      <BoardInstance label="Implementation A" />
      <div className="compare-divider" />
      <BoardInstance label="Implementation B" />
    </div>
  )
}

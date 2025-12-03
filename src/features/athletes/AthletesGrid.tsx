import type { AthleteListItem } from './types'
import { AthleteCard } from './AthleteCard'

interface AthletesGridProps {
  athletes: AthleteListItem[]
}

export function AthletesGrid({ athletes }: AthletesGridProps) {
  if (athletes.length === 0) {
    return (
      <div className="athletes-empty">
        <p>No athletes found matching your search criteria.</p>
      </div>
    )
  }

  return (
    <div className="athletes-grid">
      {athletes.map((athlete) => (
        <AthleteCard key={athlete.id} athlete={athlete} />
      ))}
    </div>
  )
}


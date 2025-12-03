import type { MemberListItem } from './types'
import { MemberCard } from './MemberCard'

interface MembersGridProps {
  members: MemberListItem[]
}

export function MembersGrid({ members }: MembersGridProps) {
  if (members.length === 0) {
    return (
      <div className="members-empty">
        <p>No members found matching your search criteria.</p>
      </div>
    )
  }

  return (
    <div className="members-grid">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  )
}


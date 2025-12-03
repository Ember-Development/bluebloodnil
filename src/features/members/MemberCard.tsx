import type { MemberListItem } from './types'

interface MemberCardProps {
  member: MemberListItem
}

const getTypeLabel = (type: MemberListItem['type']): string => {
  switch (type) {
    case 'brand':
      return 'Brand'
    case 'facility':
      return 'Training Facility'
    case 'sponsor':
      return 'Sponsor'
    case 'partner':
      return 'Partner'
    default:
      return 'Member'
  }
}

const getTypeColor = (type: MemberListItem['type']): string => {
  switch (type) {
    case 'brand':
      return 'rgba(98, 183, 255, 0.4)'
    case 'facility':
      return 'rgba(246, 196, 83, 0.4)'
    case 'sponsor':
      return 'rgba(226, 61, 61, 0.4)'
    case 'partner':
      return 'rgba(148, 163, 184, 0.4)'
    default:
      return 'rgba(255, 255, 255, 0.1)'
  }
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <article className="member-card" style={{ borderColor: getTypeColor(member.type) }}>
      <div className="member-card-header">
        <img src={member.logoUrl} alt={member.name} className="member-card-logo" />
        <span className="member-card-type">{getTypeLabel(member.type)}</span>
      </div>
      <div className="member-card-body">
        <h3 className="member-card-name">{member.name}</h3>
        {member.location && <p className="member-card-location">{member.location}</p>}
        <p className="member-card-description">{member.description}</p>
        {member.specialties.length > 0 && (
          <div className="member-card-specialties">
            {member.specialties.map((specialty) => (
              <span key={specialty} className="member-card-specialty">
                {specialty}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="member-card-footer">
        <div className="member-card-stats">
          <div className="member-card-stat">
            <span className="member-card-stat-label">Campaigns</span>
            <span className="member-card-stat-value">{member.campaignsCount}</span>
          </div>
          <div className="member-card-stat">
            <span className="member-card-stat-label">Athletes</span>
            <span className="member-card-stat-value">{member.athletesWorkedWith}</span>
          </div>
        </div>
        {member.websiteUrl && (
          <a
            href={member.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="member-card-link"
          >
            Visit website →
          </a>
        )}
      </div>
    </article>
  )
}


import { useState, useMemo, useEffect } from 'react'
import { apiClient } from '../../lib/apiClient'
import './members.css'
import type { MemberListItem } from './types'
import { MembersHeader } from './MembersHeader'
import { MembersGrid } from './MembersGrid'

interface Organization {
  id: string
  name: string
  logoUrl?: string | null
  tier?: string | null
  campaignsCount?: number
  athletesWorkedWith?: number
  createdAt: string
}

export function Members() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [members, setMembers] = useState<MemberListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true)
        console.log('Fetching organizations from /api/athletes/organizations')
        const organizations = await apiClient.get<Organization[]>('/api/athletes/organizations')
        console.log('Received organizations:', organizations)
        
        // Transform organizations to MemberListItem format
        const transformedMembers: MemberListItem[] = organizations.map((org) => ({
          id: org.id,
          name: org.name,
          type: 'brand' as const, // All organizations are brands
          logoUrl: org.logoUrl || 'https://placehold.co/120x120',
          location: undefined, // Organizations don't have location in schema
          description: org.tier 
            ? `${org.name} is a ${org.tier} tier partner working with BlueBloods NIL athletes.`
            : `${org.name} is a partner brand working with BlueBloods NIL athletes.`,
          campaignsCount: org.campaignsCount || 0,
          athletesWorkedWith: org.athletesWorkedWith || 0,
          specialties: org.tier ? [`${org.tier} Tier`, 'Brand Partner'] : ['Brand Partner'],
          websiteUrl: undefined,
          contactEmail: undefined,
        }))
        
        setMembers(transformedMembers)
      } catch (error) {
        console.error('Failed to fetch members:', error)
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error message:', error.message)
        }
        setMembers([])
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const filteredMembers = useMemo(() => {
    let filtered = [...members] // Create a copy to avoid mutating the original

    // Category filter first (if not "All")
    if (activeFilter !== 'All') {
      const typeMap: Record<string, MemberListItem['type']> = {
        Brands: 'brand',
        Facilities: 'facility',
        Sponsors: 'sponsor',
        Partners: 'partner',
      }
      const targetType = typeMap[activeFilter]
      if (targetType) {
        filtered = filtered.filter((member) => member.type === targetType)
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (member) => {
          const nameMatch = member.name.toLowerCase().includes(query)
          const descMatch = member.description.toLowerCase().includes(query)
          const locationMatch = member.location?.toLowerCase().includes(query) || false
          const specialtiesMatch = member.specialties.some((specialty) => 
            specialty.toLowerCase().includes(query)
          )
          
          return nameMatch || descMatch || locationMatch || specialtiesMatch
        }
      )
    }

    return filtered
  }, [searchQuery, activeFilter, members])

  if (loading) {
    return (
      <div className="members-container">
        <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-muted)' }}>
          Loading members...
        </div>
      </div>
    )
  }

  return (
    <div className="members-container">
      <MembersHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      {filteredMembers.length === 0 ? (
        <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--color-muted)' }}>
          {members.length === 0 
            ? 'No members found. Brands will appear here once they are added to the platform.'
            : 'No members match your search criteria.'}
        </div>
      ) : (
        <MembersGrid members={filteredMembers} />
      )}
    </div>
  )
}


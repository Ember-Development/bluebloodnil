import { useEffect, useState } from 'react'
import './feed.css'
import { FeedHeader } from './FeedHeader'
import { FeedList } from './FeedList'
import type { FeedItem } from './types'
import { apiClient } from '../../lib/apiClient'

interface PaginatedFeedResponse {
  items: FeedItem[]
  nextCursor: string | null
  hasMore: boolean
}

export function Feed() {
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [items, setItems] = useState<FeedItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInitialPosts() {
      try {
        setLoading(true)
        const response = await apiClient.get<PaginatedFeedResponse>('/api/feed/posts?limit=20')
        setItems(response.items)
        setNextCursor(response.nextCursor)
        setHasMore(response.hasMore)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch feed posts:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load feed posts'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialPosts()
  }, [])

  async function handleLoadMore() {
    if (!hasMore || !nextCursor || loadingMore) return

    try {
      setLoadingMore(true)
      const response = await apiClient.get<PaginatedFeedResponse>(
        `/api/feed/posts?cursor=${encodeURIComponent(nextCursor)}&limit=20`,
      )
      setItems((prev) => [...prev, ...response.items])
      setNextCursor(response.nextCursor)
      setHasMore(response.hasMore)
    } catch (err) {
      console.error('Failed to load more feed posts:', err)
      // Keep existing items; optional toast could go here
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <div className="feed-container">
        <FeedHeader activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-muted)' }}>
          Loading feed...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="feed-container">
        <FeedHeader activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-error)' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="feed-container">
      <FeedHeader activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <FeedList items={items} activeFilter={activeFilter} />

      {hasMore && (
        <div style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '999px',
              border: '1px solid rgba(98, 183, 255, 0.6)',
              background: loadingMore ? 'rgba(98, 183, 255, 0.15)' : 'rgba(98, 183, 255, 0.25)',
              color: '#e5f3ff',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: loadingMore ? 'default' : 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              transition: 'background 0.15s ease, transform 0.08s ease',
            }}
          >
            {loadingMore ? 'Loading more...' : 'Load more posts'}
          </button>
        </div>
      )}
    </div>
  )
}


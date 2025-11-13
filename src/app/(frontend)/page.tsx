import configPromise from '@payload-config'
import { getPayload } from 'payload'
import CreatePostForm from './CreatePostForm'
import GreetingClient from './GreetingClient'
import ProtectedContent from './ProtectedContent'

function extractPlainText(value: any): string {
  if (!value) return ''

  if (typeof value === 'string') return value

  if (Array.isArray(value)) {
    return value
      .map((item) => extractPlainText(item))
      .filter(Boolean)
      .join(' ')
  }

  if (typeof value === 'object') {
    if (typeof value.text === 'string') return value.text

    if (Array.isArray(value.children)) {
      return value.children
        .map((child) => extractPlainText(child))
        .filter(Boolean)
        .join(' ')
    }
  }

  return ''
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes.toString().padStart(2, '0')

  return `${month} ${day}, ${year} at ${displayHours}:${displayMinutes} ${ampm}`
}

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts' as any,
    depth: 2,
  })

  const categories = await payload.find({
    collection: 'categories' as any,
    limit: 100,
    sort: 'title',
  })

  const usersMap = new Map()
  if (posts.docs.length > 0) {
    const ownerIds = posts.docs
      .map((post: any) => {
        if (typeof post.owner === 'string') return post.owner
        if (typeof post.owner === 'object' && post.owner?.id) return post.owner.id
        return null
      })
      .filter(Boolean) as string[]

    if (ownerIds.length > 0) {
      const uniqueIds = [...new Set(ownerIds)]
      const users = await payload.find({
        collection: 'users' as any,
        where: { id: { in: uniqueIds } } as any,
        limit: 100,
      })

      users.docs.forEach((user: any) => {
        usersMap.set(user.id, user)
      })
    }
  }

  return (
    <div className="page-container">
      <GreetingClient />
      <ProtectedContent>
        <div className="form-card">
          <CreatePostForm categories={categories.docs || []} />
        </div>

        <div className="posts-section">
          <h2 className="posts-title">Old Posts</h2>
          <ul className="posts-list">
            {posts.docs.map((post: any) => {
              let owner = null
              if (post.owner) {
                if (typeof post.owner === 'object' && post.owner !== null && post.owner.id) {
                  owner = post.owner
                } else if (typeof post.owner === 'string') {
                  owner = usersMap.get(post.owner) || null
                }
              }

              let postCategories: any[] = []
              if (post.categories) {
                if (Array.isArray(post.categories)) {
                  postCategories = post.categories
                    .map((cat: any) => {
                      if (typeof cat === 'object' && cat !== null && cat.id) {
                        return cat
                      }
                      if (typeof cat === 'string') {
                        const found = categories.docs.find((c: any) => c.id === cat)
                        return found || null
                      }
                      return null
                    })
                    .filter((cat: any) => cat !== null && cat !== undefined)
                } else if (typeof post.categories === 'string') {
                  const found = categories.docs.find((c: any) => c.id === post.categories)
                  if (found) postCategories = [found]
                }
              }

              const contentText = extractPlainText(post.content).trim()

              return (
                <li key={post.id} className="post-card">
                  <div className="post-header">
                    <div style={{ flex: 1 }}>
                      <h3 className="post-title">{post.title}</h3>
                      {owner && (
                        <p className="post-meta">
                          by {owner.email || owner.name || 'Unknown user'}
                        </p>
                      )}
                      {!owner && <p className="post-meta">by Unknown user</p>}
                      <p className="post-meta">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  {contentText && <p className="post-content">{contentText}</p>}
                  {postCategories.length > 0 && (
                    <div className="post-categories">
                      {postCategories.map((cat: any) => (
                        <span key={cat.id || cat} className="category-tag">
                          {cat.title || cat.slug || 'Unknown'}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </ProtectedContent>
    </div>
  )
}

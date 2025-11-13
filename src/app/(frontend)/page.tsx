import configPromise from '@payload-config'
import { getPayload } from 'payload'
import CreatePostForm from './CreatePostForm'
import GreetingClient from './GreetingClient'
import ProtectedContent from './ProtectedContent'

type RichTextNode = {
  text?: unknown
  children?: unknown[]
}

type RichTextLike = string | RichTextNode | RichTextLike[]

type UserSummary = {
  id: string
  email?: string | null
}

type CategorySummary = {
  id: string
  title?: string | null
  slug?: string | null
}

type PostSummary = {
  id: string
  title: string
  owner?: string | UserSummary | null
  categories?: (string | CategorySummary | null)[] | string | null
  content?: { root?: unknown } | null
  createdAt: string
}

function extractPlainText(value: RichTextLike | null | undefined): string {
  if (!value) return ''

  if (typeof value === 'string') return value

  if (Array.isArray(value)) {
    return value
      .map((item) => extractPlainText(item as RichTextLike))
      .filter(Boolean)
      .join(' ')
  }

  if (typeof value === 'object') {
    const node = value as RichTextNode

    if (typeof node.text === 'string') return node.text

    if (Array.isArray(node.children)) {
      return node.children
        .map((child) => extractPlainText(child as RichTextLike))
        .filter(Boolean)
        .join(' ')
    }
  }

  return ''
}

function extractFromContent(content: PostSummary['content']): string {
  if (!content || typeof content !== 'object') return ''
  return extractPlainText(content.root as RichTextLike).trim()
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
  const postsResult = await payload.find({
    collection: 'posts',
    depth: 2,
  })

  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })

  const posts = postsResult.docs as PostSummary[]
  const categories = categoriesResult.docs as CategorySummary[]

  const usersMap = new Map<string, UserSummary>()
  if (posts.length > 0) {
    const ownerIds = posts
      .map((post) => {
        if (typeof post.owner === 'string') return post.owner
        if (post.owner && typeof post.owner === 'object' && 'id' in post.owner) {
          return (post.owner as UserSummary).id
        }
        return null
      })
      .filter(Boolean) as string[]

    if (ownerIds.length > 0) {
      const uniqueIds = [...new Set(ownerIds)]
      const usersResult = await payload.find({
        collection: 'users',
        where: { id: { in: uniqueIds } },
        limit: 100,
      })

      const users = usersResult.docs as UserSummary[]

      users.forEach((user) => {
        usersMap.set(user.id, user)
      })
    }
  }

  const categoriesById = new Map<string, CategorySummary>(categories.map((cat) => [cat.id, cat]))
  const formCategories = categories.map((cat) => ({
    id: cat.id,
    title: cat.title ?? cat.slug ?? 'Untitled category',
    slug: cat.slug ?? undefined,
  }))

  return (
    <div className="page-container">
      <GreetingClient />
      <ProtectedContent>
        <div className="form-card">
          <CreatePostForm categories={formCategories} />
        </div>

        <div className="posts-section">
          <h2 className="posts-title">Old Posts</h2>
          <ul className="posts-list">
            {posts.map((post) => {
              let owner: UserSummary | null = null
              if (post.owner) {
                if (typeof post.owner === 'object' && post.owner !== null && 'id' in post.owner) {
                  owner = post.owner as UserSummary
                } else if (typeof post.owner === 'string') {
                  owner = usersMap.get(post.owner) || null
                }
              }

              let postCategories: CategorySummary[] = []
              if (post.categories) {
                if (Array.isArray(post.categories)) {
                  postCategories = post.categories
                    .map((cat) => {
                      if (typeof cat === 'object' && cat !== null && 'id' in cat) {
                        return cat as CategorySummary
                      }
                      if (typeof cat === 'string') {
                        const found = categoriesById.get(cat)
                        return found || null
                      }
                      return null
                    })
                    .filter((cat): cat is CategorySummary => cat !== null && cat !== undefined)
                } else if (typeof post.categories === 'string') {
                  const found = categoriesById.get(post.categories)
                  if (found) postCategories = [found]
                }
              }

              const contentText = extractFromContent(post.content)

              return (
                <li key={post.id} className="post-card">
                  <div className="post-header">
                    <div style={{ flex: 1 }}>
                      <h3 className="post-title">{post.title}</h3>
                      {owner && <p className="post-meta">by {owner.email || 'Unknown user'}</p>}
                      {!owner && <p className="post-meta">by Unknown user</p>}
                      <p className="post-meta">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  {contentText && <p className="post-content">{contentText}</p>}
                  {postCategories.length > 0 && (
                    <div className="post-categories">
                      {postCategories.map((cat) => (
                        <span key={cat.id} className="category-tag">
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

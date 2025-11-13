'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

const detailDefault = 0
const formatDefault = 0
const modeDefault = 'normal'

const lexicalVersion = 1 as const

function buildLexicalContent(raw: string) {
  const paragraphs = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line, index, all) => line.length > 0 || all.length === 1)

  const children = paragraphs.map((paragraph) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: lexicalVersion,
    direction: 'ltr' as const,
    children: paragraph.length
      ? [
          {
            type: 'text',
            text: paragraph,
            version: lexicalVersion,
            detail: detailDefault,
            format: formatDefault,
            mode: modeDefault,
            style: '',
          },
        ]
      : [],
  }))

  return {
    root: {
      type: 'root' as const,
      format: '',
      indent: 0,
      version: lexicalVersion,
      direction: 'ltr' as const,
      children:
        children.length > 0
          ? children
          : [
              {
                type: 'paragraph',
                format: '',
                indent: 0,
                version: lexicalVersion,
                direction: 'ltr' as const,
                children: [
                  {
                    type: 'text',
                    text: raw,
                    version: lexicalVersion,
                    detail: detailDefault,
                    format: formatDefault,
                    mode: modeDefault,
                    style: '',
                  },
                ],
              },
            ],
    },
  }
}

type CreatePostInput = {
  title: string
  content: string
  categories?: string[]
  userEmail?: string | null
}

type UserDocument = {
  id: string
}

type PostDocument = {
  id: string
}

export async function createPost(data: CreatePostInput) {
  try {
    const payload = await getPayload({ config: configPromise })

    let ownerId: string | undefined
    if (data.userEmail) {
      const users = await payload.find({
        collection: 'users',
        where: { email: { equals: data.userEmail } },
        limit: 1,
      })

      const userDocs = users.docs as UserDocument[]
      if (userDocs.length > 0) {
        ownerId = userDocs[0].id
      }
    }

    const makeSlug = (s: string) =>
      s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

    let baseSlug = makeSlug(data.title || 'post')
    if (!baseSlug) baseSlug = `post-${Date.now()}`

    let slug = baseSlug
    let i = 0
    while (true) {
      const existing = await payload.find({
        collection: 'posts',
        where: { slug: { equals: slug } },
        depth: 0,
      })

      const postDocs = existing.docs as PostDocument[]
      if (!existing || postDocs.length === 0) break

      i += 1
      slug = `${baseSlug}-${i}`
    }

    await payload.create({
      collection: 'posts',
      data: {
        title: data.title,
        slug,
        content: buildLexicalContent(data.content),
        categories: data.categories && data.categories.length ? data.categories : undefined,
        owner: ownerId,
      },
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}

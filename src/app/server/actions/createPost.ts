'use server';

import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function createPost(data: { title: string; content: string; categories?: string[]; userEmail?: string | null }) {
  try {
    const payload = await getPayload({ config: configPromise })

    let ownerId: string | undefined = undefined
    if (data.userEmail) {
      const users = await payload.find({
        collection: 'users' as any,
        where: { email: { equals: data.userEmail } } as any,
        limit: 1,
      } as any)

      if (users.docs.length > 0) {
        ownerId = users.docs[0].id
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
        collection: 'posts' as any,
        where: { slug: { equals: slug } } as any,
        depth: 0,
      } as any)

      if (!existing || (existing && existing.totalDocs === 0)) break

      i += 1
      slug = `${baseSlug}-${i}`
    }

    await payload.create({
      collection: 'posts' as any,
      data: {
        title: data.title,
        slug,
        content: data.content,
        categories: data.categories && data.categories.length ? data.categories : undefined,
        owner: ownerId,
      },
    } as any)
  } catch (e) {
    console.error(e)
    throw e
  }
}

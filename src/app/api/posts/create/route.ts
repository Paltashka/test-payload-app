import { createPost } from '@/app/server/actions/createPost'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { title, content, categories, userEmail } = await req.json()

    await createPost({
      title,
      content,
      categories: categories || [],
      userEmail,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Create post error', e)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

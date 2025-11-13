import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json()

    const payload = await getPayload({ config: configPromise })

    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    if (result && result.user) {
      return NextResponse.json({ user: { email: result.user.email } })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (e) {
    console.error('Login route error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

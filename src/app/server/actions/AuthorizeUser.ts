'use server';

import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function authorizeUser({ email, password }: { email: string; password: string }) {
  try {
    const payload = await getPayload({ config: configPromise })

    // payload.login may not be typed in this environment, so use any to call it
    const result = await (payload as any).login({
      collection: 'users',
      data: { email, password },
    })

    // result usually contains { user, token }
    return result
  } catch (e) {
    console.error('authorizeUser error', e)
    return null
  }
}

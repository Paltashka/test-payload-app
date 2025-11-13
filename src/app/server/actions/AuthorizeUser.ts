'use server';

import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function authorizeUser({ email, password }: { email: string; password: string }) {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    // result usually contains { user, token }
    return result
  } catch (error) {
    console.error('authorizeUser error', error)
    return null
  }
}

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import { Categories } from './collections/Categories'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_PAYLOAD_URL,
  admin: {
    user: 'users',
  },
  collections: [Users, Posts, Categories],
  db: mongooseAdapter({
    url:
      process.env.MONGO_URL ||
      process.env.DATABASE_URI ||
      process.env.MONGODB_URI ||
      'mongodb://localhost/payload_test',
  }),
  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME_TO_A_STRONG_SECRET',
})

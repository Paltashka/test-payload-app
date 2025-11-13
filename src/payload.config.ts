import { buildConfig } from 'payload';
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { Users } from './collections/Users';
import { Posts } from './collections/Posts';
import { Categories } from './collections/Categories';

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_PAYLOAD_URL,
  admin: {
    user: 'users',
  },
  collections: [Users, Posts, Categories],
  db: mongooseAdapter({ url: process.env.MONGO_URL || process.env.DATABASE_URI || 'mongodb://localhost/payload_test' }) as any,
  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME_TO_A_STRONG_SECRET',
});

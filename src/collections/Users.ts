import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [{ name: 'role', type: 'text' }],
}

export default Users

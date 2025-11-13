import payload from 'payload'

export const Users = {
  slug: 'users',
  auth: true,
  fields: [{ name: 'role', type: 'text' }],
} satisfies typeof payload['collections'][string]

export default Users

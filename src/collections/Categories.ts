import payload from 'payload'

export const Categories = {
  slug: 'categories',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'content', type: 'textarea' },
    {
      name: 'posts',
      label: 'Posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
} satisfies typeof payload['collections'][string]

export default Categories

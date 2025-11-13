import { lexicalEditor } from '@payloadcms/richtext-lexical'
import payload from 'payload'

export const Posts = {
  slug: 'posts',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'content', type: 'richText', editor: lexicalEditor() },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
} satisfies typeof payload['collections'][string]

export default Posts

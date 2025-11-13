'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import CategorySelect from './CategorySelect'

interface Category {
  id: string
  title: string
  slug?: string
}

interface CreatePostFormProps {
  categories: Category[]
}

export default function CreatePostForm({ categories }: CreatePostFormProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!title || !content) {
      alert('Please fill in title and content')
      return
    }

    const userEmail = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null

    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          categories: selectedCategories,
          userEmail,
        }),
      })

      if (res.ok) {
        setTitle('')
        setContent('')
        setSelectedCategories([])
        if (formRef.current) {
          formRef.current.reset()
        }
        router.refresh()
      } else {
        alert('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post')
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Title
        </label>
        <input
          id="title"
          name="title"
          className="form-input"
          placeholder="Enter post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="content" className="form-label">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          className="form-textarea"
          placeholder="Enter post content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="categories" className="form-label">
          Categories
        </label>
        <CategorySelect
          categories={categories}
          name="categories"
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />
      </div>
      <button type="submit" className="submit-button">
        Create Post
      </button>
    </form>
  )
}

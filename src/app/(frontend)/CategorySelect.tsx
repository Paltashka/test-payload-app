'use client'

import { useState, useRef, useEffect } from 'react'

interface Category {
  id: string
  title: string
  slug?: string
}

interface CategorySelectProps {
  categories: Category[]
  name: string
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function CategorySelect({
  categories,
  name,
  selected,
  onChange,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCategories = categories.filter((cat) =>
    (cat.title || cat.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCategories = categories.filter((cat) => selected.includes(cat.id))

  const toggleCategory = (categoryId: string) => {
    if (selected.includes(categoryId)) {
      onChange(selected.filter((id) => id !== categoryId))
    } else {
      onChange([...selected, categoryId])
    }
  }

  const removeCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((id) => id !== categoryId))
  }

  return (
    <div className="category-select-container" ref={dropdownRef}>
      {selected.map((catId) => (
        <input key={catId} type="hidden" name={name} value={catId} />
      ))}
      <div
        className="category-select-tags"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        {selectedCategories.length > 0 ? (
          <div className="category-tags-list">
            {selectedCategories.map((cat) => (
              <span key={cat.id} className="category-tag-selected">
                {cat.title || cat.slug || 'Untitled'}
                <button
                  type="button"
                  className="category-tag-remove"
                  onClick={(e) => removeCategory(cat.id, e)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="category-select-placeholder">Select categories</span>
        )}
        <svg
          className={`category-select-arrow ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 9L1 4h10z" fill="currentColor" />
        </svg>
      </div>

      {isOpen && (
        <div className="category-select-dropdown">
          <div className="category-select-search">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.5 10.5l-3-3m-5-2a4.5 4.5 0 109 0 4.5 4.5 0 00-9 0z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="category-select-search-input"
            />
          </div>
          <div className="category-select-options">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => {
                const isSelected = selected.includes(cat.id)
                return (
                  <div
                    key={cat.id}
                    className={`category-select-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCategory(cat.id)}
                    role="button"
                    tabIndex={0}
                  >
                    {isSelected && (
                      <svg
                        className="category-select-checkmark"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 8l3 3 7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <span>{cat.title || cat.slug || 'Untitled'}</span>
                  </div>
                )
              })
            ) : (
              <div className="category-select-no-results">No categories found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


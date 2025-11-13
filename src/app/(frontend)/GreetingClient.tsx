'use client'

import { useEffect, useState } from 'react'

export default function GreetingClient() {
  const [user, setUser] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user')

      if (storedUser) {
        setUser(storedUser)
        setIsChecking(false)
        return
      }

      const params = new URL(window.location.href).searchParams
      const u = params.get('user')

      if (u) {
        sessionStorage.setItem('user', u)
        setUser(u)
        const url = new URL(window.location.href)
        url.searchParams.delete('user')
        window.history.replaceState({}, document.title, url.pathname + url.search)
        setIsChecking(false)
      } else {
        window.location.href = '/login'
      }
    } catch (_error) {
      window.location.href = '/login'
    }
  }, [])

  function handleLogout() {
    sessionStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (isChecking || !user) {
    return null
  }

  return (
    <>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      <div className="greeting-section">
        <h1 className="greeting-title">Hello, {user}!</h1>
        <p className="greeting-subtitle">Create a new post</p>
      </div>
    </>
  )
}

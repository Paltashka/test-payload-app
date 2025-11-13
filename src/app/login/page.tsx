'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import '../(frontend)/styles.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // Очищаємо поля при завантаженні сторінки
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.value = ''
    }
    if (passwordRef.current) {
      passwordRef.current.value = ''
    }
    setEmail('')
    setPassword('')
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      const data = await res.json()
      const userEmail = data.user?.email
      if (userEmail) {
        const url = new URL(window.location.href)
        url.pathname = '/'
        url.searchParams.set('user', userEmail)
        router.push(url.pathname + url.search)
        return
      }
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h1 className="login-title">Login to your account</h1>
        <p className="login-subtitle">Enter your email below to login to your account</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email
            </label>
            <input
              ref={emailRef}
              id="login-email"
              type="email"
              className="form-input"
              placeholder="test@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              ref={passwordRef}
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

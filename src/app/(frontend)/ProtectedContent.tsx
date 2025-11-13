'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedContent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

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
        router.push('/login')
      }
    } catch (e) {
      router.push('/login')
    }
  }, [router])

  if (isChecking || !user) {
    return null
  }

  return <>{children}</>
}


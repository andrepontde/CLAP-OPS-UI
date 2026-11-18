import { useState, type ReactNode } from 'react'
import { apiRequest } from './api'
import { AuthContext } from './auth-context'

const TOKEN_KEY = 'clap_ops_access_token'

interface LoginResponse {
  access_token: string
  token_type: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => sessionStorage.getItem(TOKEN_KEY),
  )

  async function login(email: string, password: string) {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    sessionStorage.setItem(TOKEN_KEY, response.access_token)
    setAccessToken(response.access_token)
  }

  async function logout() {
    if (accessToken) {
      try {
        await apiRequest<undefined>('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } finally {
        sessionStorage.removeItem(TOKEN_KEY)
        setAccessToken(null)
      }
      return
    }

    sessionStorage.removeItem(TOKEN_KEY)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

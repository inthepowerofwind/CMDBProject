import api from './axios'

export interface AuthUser {
  id: number
  name: string
  email: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  message: string
  user: AuthUser
  token: string
}

// authentication service for user login, logout, and profile updates
export const authService = {

  // sends login credentials, then stores the token and user in localStorage
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },

  // calls the logout endpoint then clears the token and user from localStorage
  async logout(): Promise<void> {
    await api.post('/auth/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // reads the stored user object from localStorage without making an API call
  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  },

  // returns true if a token exists in localStorage
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },

  // updates the display name then refreshes the stored user in localStorage
  async updateUsername(name: string): Promise<AuthUser> {
    const { data } = await api.patch<{ message: string; user: AuthUser }>('/auth/username', { name })
    localStorage.setItem('user', JSON.stringify(data.user))
    return data.user
  },

}
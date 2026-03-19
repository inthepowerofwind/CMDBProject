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

export const authService = {

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },

}
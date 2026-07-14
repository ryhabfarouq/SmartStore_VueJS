import { ref, computed } from 'vue'
import { API_BASE_URL } from '../config'

export interface User {
  _id: string
  name: string
  email: string
  role: 'Customer' | 'Seller' | 'Admin'
  phone?: string
  address?: string
}

// Global shared state
const user = ref<User | null>(null)
const token = ref<string | null>(null)
const isRestoring = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'Admin')
  const isSeller = computed(() => user.value?.role === 'Seller')

  const setSession = (userData: User, userToken: string) => {
    user.value = userData
    token.value = userToken
    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearSession = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  /**
   * Log in user using email and password
   */
  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Login failed')
    }

    const data = await res.json()
    setSession(data, data.token)
    return data
  }

  /**
   * Register a new user
   */
  const register = async (userData: any) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Registration failed')
    }

    const data = await res.json()
    setSession(data, data.token)
    return data
  }

  /**
   * Restore user session from localStorage and verify with server
   */
  const restoreSession = async () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (!storedToken || !storedUser) {
      clearSession()
      return
    }

    // Set local state temporarily during network check
    token.value = storedToken
    user.value = JSON.parse(storedUser)

    isRestoring.value = true
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })

      if (res.ok) {
        const verifiedUser = await res.json()
        user.value = verifiedUser
        localStorage.setItem('user', JSON.stringify(verifiedUser))
      } else {
        // Token expired/invalid, clear session
        clearSession()
      }
    } catch (err) {
      console.error('Session validation with server failed:', err)
      // On network failure, we preserve the offline cache state
    } finally {
      isRestoring.value = false
    }
  }

  /**
   * Update current user profile details
   */
  const updateProfile = async (profileData: any) => {
    if (!token.value) throw new Error('Not authenticated')

    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(profileData)
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Update failed')
    }

    const updatedUser = await res.json()
    user.value = { ...user.value, ...updatedUser }
    localStorage.setItem('user', JSON.stringify(user.value))
    return user.value
  }

  /**
   * Log out user
   */
  const logout = () => {
    clearSession()
  }

  return {
    user,
    token,
    isRestoring,
    isAuthenticated,
    isAdmin,
    isSeller,
    login,
    register,
    logout,
    restoreSession,
    updateProfile
  }
}

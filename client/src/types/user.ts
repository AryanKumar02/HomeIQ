// User-related types for authentication and user management

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role?: string
  avatar?: string
  createdAt: string
  emailVerified: boolean
}

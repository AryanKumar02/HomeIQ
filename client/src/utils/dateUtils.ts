/**
 * Date formatting utilities for the tenant management system
 */

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Dec 15, 2023")
 */
export const formatLeaseEndDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

/**
 * Calculates the number of days until lease expiration
 * @param dateString - ISO date string
 * @returns Number of days (positive = future, negative = past)
 */
export const getDaysUntilLeaseEnd = (dateString: string): number => {
  try {
    const leaseEndDate = new Date(dateString)
    const today = new Date()

    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0)
    leaseEndDate.setHours(0, 0, 0, 0)

    const diffTime = leaseEndDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  } catch (error) {
    console.error('Error calculating days until lease end:', error)
    return 0
  }
}

/**
 * Checks if a lease is expiring soon (within 30 days)
 * @param dateString - ISO date string
 * @returns True if expiring within 30 days
 */
export const isLeaseExpiringSoon = (dateString: string): boolean => {
  const daysUntilEnd = getDaysUntilLeaseEnd(dateString)
  return daysUntilEnd <= 30 && daysUntilEnd >= 0
}

/**
 * Formats currency amount
 * @param amount - Numeric amount
 * @returns Formatted currency string (e.g., "$1,250")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Generates initials from a full name
 * @param name - Full name string
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export const generateInitials = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return '?'
  }

  const words = name.trim().split(/\s+/)
  if (words.length === 0) {
    return '?'
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

/**
 * Generates a consistent color for an avatar based on the name
 * @param name - Full name string
 * @returns Color hex code
 */
export const generateAvatarColor = (name: string): string => {
  const colors = [
    '#1976d2', // Blue
    '#388e3c', // Green
    '#f57c00', // Orange
    '#7b1fa2', // Purple
    '#c2185b', // Pink
    '#00796b', // Teal
    '#5d4037', // Brown
    '#455a64', // Blue Grey
    '#e91e63', // Pink
    '#009688', // Teal
  ]

  if (!name || typeof name !== 'string') {
    return colors[0]
  }

  // Generate a hash from the name to ensure consistent colors
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}

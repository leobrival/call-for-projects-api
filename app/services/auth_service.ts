import type { HttpContext } from '@adonisjs/core/http'

/**
 * Authentication service to centralize common logic
 */
export default class AuthService {
  /**
   * Standardized user format for responses
   */
  static formatUserForResponse(user: any) {
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    }
  }

  /**
   * Retrieves authentication data for Inertia.js pages
   */
  static async getAuthDataForInertia(auth: HttpContext['auth']) {
    let user = null
    try {
      await auth.use('web').check()
      user = auth.use('web').user
    } catch {
      // User not authenticated, user remains null
    }

    return {
      auth: {
        user: this.formatUserForResponse(user),
      },
    }
  }

  /**
   * Retrieves the authenticated user for protected pages
   */
  static getUserForProtectedPage(auth: HttpContext['auth']) {
    const user = auth.use('web').user
    return this.formatUserForResponse(user)
  }

  /**
   * Validates and formats login data
   */
  static validateCredentials(
    email: string,
    password: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!email || !email.trim()) {
      errors.push('Email is required')
    }

    if (!password || !password.trim()) {
      errors.push('Password is required')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Handles smart redirection after login/registration
   */
  static getRedirectUrl(session: HttpContext['session'], defaultUrl: string = '/') {
    return session.pull('intended_url', defaultUrl)
  }

  /**
   * Stores the destination URL for post-authentication redirection
   */
  static storeIntendedUrl(session: HttpContext['session'], url: string) {
    session.put('intended_url', url)
  }
}

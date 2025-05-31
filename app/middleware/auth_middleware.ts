import type { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Auth middleware is used to authenticate HTTP requests and deny
 * access to unauthenticated users.
 *
 * This implementation uses only the standard AdonisJS authentication system.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to when authentication fails
   */
  redirectTo = '/login'

  /**
   * Log authorization header (redacting the actual token)
   */
  private logAuthHeader(ctx: HttpContext): void {
    const authHeader = ctx.request.header('authorization')
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        const tokenLength = authHeader.length - 7
        console.log(`DEBUG auth middleware: found Bearer token (length: ${tokenLength})`)
      } else {
        console.log('DEBUG auth middleware: found non-Bearer authorization header')
      }
    } else {
      console.log('DEBUG auth middleware: no authorization header present')
    }
  }

  /**
   * Handle the request by authenticating the user
   * Uses only standard AdonisJS authentication methods
   */
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    // Get guards from options or use default
    const guards = options.guards || ['api']

    // Log debugging information
    console.log('DEBUG auth middleware: using guards =', guards)
    this.logAuthHeader(ctx)

    try {
      // For tests, it's important to use silent=true to prevent redirects
      // This is how we make sure we get proper 401 responses in API contexts
      await ctx.auth.authenticateUsing(guards, {
        loginRoute: this.redirectTo,
        silent: true,
      })

      // If we get here, authentication succeeded
      console.log('DEBUG auth middleware: authentication successful, user =', ctx.auth.user?.id)

      // Proceed with the request
      return next()
    } catch (error) {
      // Authentication failed
      console.log('DEBUG auth middleware: authentication failed -', error.message)

      // Return consistent error response
      return this.handleUnauthenticated(ctx)
    }
  }

  /**
   * Handle unauthenticated requests with proper JSON response
   */
  private handleUnauthenticated(ctx: HttpContext) {
    const response = {
      errors: [{ message: 'Unauthorized access' }],
    }

    // Always return 401 with consistent error format
    console.log('DEBUG auth middleware: returning 401 Unauthorized response')
    return ctx.response.status(401).json(response)
  }
}

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

    try {
      // Authenticate using the specified guards
      await ctx.auth.authenticateUsing(guards, {
        loginRoute: this.redirectTo,
      })

      // Proceed with the request
      return next()
    } catch (error) {
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
    return ctx.response.status(401).json(response)
  }
}

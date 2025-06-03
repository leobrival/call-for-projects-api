import AuthService from '#services/auth_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Web authentication middleware for Inertia.js pages
 * Redirects unauthenticated users to /login instead of returning JSON
 */
export default class WebAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Check if user is authenticated using the 'web' guard
     */
    try {
      await ctx.auth.use('web').authenticate()
      await next()
    } catch {
      /**
       * Store intended URL in session before redirecting to login
       */
      const intendedUrl = ctx.request.url()
      AuthService.storeIntendedUrl(ctx.session, intendedUrl)

      return ctx.response.redirect('/login')
    }
  }
}

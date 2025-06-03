import User from '#models/user'
import AuthService from '#services/auth_service'
import { signupValidator } from '#validators/signup'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'

export default class AuthController {
  /**
   * User registration (sign-up)
   */
  async signup({ request, response }: HttpContext) {
    const payload = await vine.validate({ schema: signupValidator, data: request.all() })
    const exists = await User.findBy('email', payload.email)
    if (exists) {
      return response.conflict({ message: 'Email already registered' })
    }
    const user = await User.create(payload)
    return response.created(AuthService.formatUserForResponse(user))
  }

  /**
   * User login (sign-in)
   */
  async signin({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    // Find user by email
    const user = await User.findBy('email', email)
    if (!user) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }

    // Verify password
    const valid = await hash.verify(user.password, password)
    if (!valid) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }

    try {
      // Create a new token with specific abilities
      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '30 days',
      })

      if (!token || !token.value) {
        console.error('Token creation failed - empty token returned')
        return response.internalServerError({ message: 'Error creating access token' })
      }

      // Verify the token immediately to ensure it works
      try {
        // Directly verify the token to ensure it's valid
        const verifiedToken = await User.accessTokens.verify(token.value!)

        if (!verifiedToken) {
          console.error('Token verification failed - token not found')
          return response.internalServerError({ message: 'Error validating token' })
        }

        // Return enhanced response format with more token information
        return response.ok({
          token: token.value!.release(),
          type: 'bearer',
          expires_in: 30 * 24 * 60 * 60, // 30 days in seconds
          token_type: 'auth_token',
          abilities: ['*'],
          user: AuthService.formatUserForResponse(user),
        })
      } catch (verifyError) {
        console.error('Token verification error:', verifyError.message)
        return response.internalServerError({ message: 'Error validating created token' })
      }
    } catch (error) {
      console.error('Error creating token:', error)
      return response.internalServerError({ message: 'Error creating token' })
    }
  }

  /**
   * User logout (revoke access token)
   */
  async logout({ auth, response }: HttpContext) {
    try {
      // The user is already authenticated by the middleware, so we can use auth.user
      const user = auth.user

      if (!user) {
        return response.unauthorized({ message: 'No active session' })
      }

      // Revoke all tokens for this user
      const tokens = await User.accessTokens.all(user)
      await Promise.all(tokens.map((token) => User.accessTokens.delete(user, token.identifier)))

      return response.ok({ message: 'Logged out' })
    } catch (error) {
      console.error('Logout error:', error)
      return response.unauthorized({ message: 'No active session' })
    }
  }

  /**
   * Web login for Inertia.js pages (session-based)
   */
  async loginWeb({ request, response, auth, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      // Redirect to intended URL or default to home page
      const intendedUrl = AuthService.getRedirectUrl(session)
      return response.redirect(intendedUrl)
    } catch {
      return response.redirect('/login')
    }
  }

  /**
   * Web logout for Inertia.js pages (session-based)
   */
  async logoutWeb({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }

  /**
   * Web signup for Inertia.js pages (session-based)
   */
  async signupWeb({ request, response, auth, session }: HttpContext) {
    try {
      const payload = await vine.validate({
        schema: signupValidator,
        data: request.all(),
      })

      const exists = await User.findBy('email', payload.email)
      if (exists) {
        session.flash('errors', { email: 'Cette adresse email est déjà utilisée' })
        return response.redirect('/register')
      }

      const user = await User.create(payload)
      await auth.use('web').login(user)

      // Redirect to intended URL or default to home page
      const intendedUrl = AuthService.getRedirectUrl(session)
      return response.redirect(intendedUrl)
    } catch (error) {
      session.flash('errors', { general: 'Erreur lors de la création du compte' })
      return response.redirect('/register')
    }
  }
}

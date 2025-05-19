import User from '#models/user'
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
    return response.created({ id: user.id, email: user.email, fullName: user.fullName })
  }

  /**
   * User login (sign-in)
   */
  async signin({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.findBy('email', email)
    if (!user) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
    const valid = await hash.verify(user.password, password)
    if (!valid) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
    const token = await User.accessTokens.create(user)
    return {
      token: token.value,
      type: 'bearer',
      user: { id: user.id, email: user.email, fullName: user.fullName },
    }
  }

  /**
   * User logout (revoke access token)
   */
  async logout({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    if (!auth.user || !auth.user.currentAccessToken) {
      return response.unauthorized({ message: 'No active session' })
    }
    await User.accessTokens.delete(user, auth.user.currentAccessToken.identifier)
    return response.ok({ message: 'Logged out' })
  }
}

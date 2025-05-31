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
    console.log('DEBUG signin: email =', email)

    // Find user by email
    const user = await User.findBy('email', email)
    if (!user) {
      console.log('DEBUG signin: user not found')
      return response.unauthorized({ message: 'Invalid credentials' })
    }
    console.log('DEBUG signin: user found, id =', user.id)

    // Verify password
    const valid = await hash.verify(user.password, password)
    if (!valid) {
      console.log('DEBUG signin: invalid password')
      return response.unauthorized({ message: 'Invalid credentials' })
    }
    console.log('DEBUG signin: password valid')

    try {
      // Create a new token with specific options
      const token = await User.accessTokens.create(user, {
        // Provide explicit token options
        name: 'api_auth_token', // Token name for identification
        abilities: ['*'], // All abilities
        expiresIn: '30 days', // Set expiration (long for testing)
        tokenType: 'auth_token', // Specify token type
      })

      if (!token || !token.value) {
        console.error('DEBUG signin: token creation failed - empty token returned')
        return response.internalServerError({ message: 'Error creating access token' })
      }

      // Log the token details for debugging
      console.log('DEBUG signin: token created, value =', '[redacted]')
      console.log('DEBUG signin: token type =', typeof token.value)
      console.log('DEBUG signin: token length =', token.value ? token.value.length : 0)

      // Verify the token immediately to ensure it works
      try {
        // Directly verify the token to ensure it's valid
        const verifiedToken = await User.accessTokens.verify(token.value)

        if (!verifiedToken) {
          console.error('DEBUG signin: token verification failed - token not found')
          return response.internalServerError({ message: 'Error validating token' })
        }

        console.log('DEBUG signin: token successfully verified after creation')
        console.log('DEBUG signin: token details:', {
          tokenableId: verifiedToken.tokenableId,
          type: verifiedToken.type,
          abilities: verifiedToken.abilities,
        })

        // Return enhanced response format with more token information
        return response.ok({
          token: token.value,
          type: 'bearer',
          expires_in: 30 * 24 * 60 * 60, // 30 days in seconds
          token_type: 'auth_token',
          abilities: ['*'],
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
          },
        })
      } catch (verifyError) {
        console.error('DEBUG signin: token verification error:', verifyError.message)
        return response.internalServerError({ message: 'Error validating created token' })
      }
    } catch (error) {
      console.error('DEBUG signin: error creating token:', error)
      return response.internalServerError({ message: 'Error creating token' })
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

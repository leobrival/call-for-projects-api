/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import User from '#models/user'

const AuthController = () => import('#controllers/auth_controller')
const OrganizationsController = () => import('#controllers/organizations_controller')
const ProjectsController = () => import('#controllers/projects_controller')
const UsersController = () => import('#controllers/users_controller')

router
  .group(() => {
    // Routes publiques
    router.on('/').render('pages/home')
    router.post('/signup', [AuthController, 'signup'])
    router.post('/signin', [AuthController, 'signin'])

    // Routes protégées
    router
      .group(() => {
        router.post('/logout', [AuthController, 'logout'])

        // Endpoint de test pour l'authentification avec débogage détaillé
        router.get('/auth-test', async ({ auth, request, response }) => {
          console.log('DEBUG auth-test: received request')

          // Extract and log the token from the header
          const authHeader = request.header('authorization')
          if (!authHeader) {
            console.log('DEBUG auth-test: no authorization header')
            return response.unauthorized({
              message: 'Authentication failed',
              reason: 'No authorization header provided',
            })
          }

          console.log('DEBUG auth-test: authorization header found')

          // Verify token format
          if (!authHeader.startsWith('Bearer ')) {
            console.log('DEBUG auth-test: invalid authorization format')
            return response.unauthorized({
              message: 'Authentication failed',
              reason: 'Invalid authorization format',
            })
          }

          const token = authHeader.slice(7) // Remove 'Bearer ' prefix
          console.log(`DEBUG auth-test: token extracted, length: ${token.length}`)

          let manualVerification = {
            success: false,
            user: null,
            tokenInfo: null,
            error: null,
          }

          // Step 1: Try manual token verification (for debugging)
          try {
            console.log('DEBUG auth-test: attempting manual token verification')
            const verifiedToken = await User.accessTokens.verify(token)

            if (verifiedToken) {
              console.log('DEBUG auth-test: manual token verification successful')
              console.log('DEBUG auth-test: token details:', {
                tokenableId: verifiedToken.tokenableId,
                type: verifiedToken.type,
                abilities: verifiedToken.abilities,
              })

              // Find user in database
              const user = await User.find(verifiedToken.tokenableId)

              if (user) {
                console.log(`DEBUG auth-test: user found: ${user.id}`)
                manualVerification = {
                  success: true,
                  user,
                  tokenInfo: verifiedToken,
                  error: null,
                }
              } else {
                console.log('DEBUG auth-test: user not found in database')
                manualVerification.error = 'User not found'
              }
            }
          } catch (verifyError) {
            console.log('DEBUG auth-test: manual token verification failed:', verifyError.message)
            manualVerification.error = verifyError.message
          }

          // Step 2: Try standard authentication regardless of manual verification
          let standardAuth = {
            success: false,
            user: null,
            error: null,
          }

          try {
            console.log('DEBUG auth-test: attempting standard authentication')
            const authenticatedUser = await auth.authenticate()

            console.log(
              `DEBUG auth-test: standard authentication successful: ${authenticatedUser.id}`
            )
            standardAuth = {
              success: true,
              user: authenticatedUser,
              error: null,
            }
          } catch (authError) {
            console.log('DEBUG auth-test: standard authentication failed:', authError.message)
            standardAuth.error = authError.message
          }

          // Step 3: Determine response based on verification results

          // Case 1: Standard auth succeeded
          if (standardAuth.success) {
            return response.ok({
              message: 'Authentication successful (standard)',
              method: 'standard',
              user: {
                id: standardAuth.user.id,
                email: standardAuth.user.email,
              },
              token: {
                verified: true,
                manualVerification: manualVerification.success,
              },
            })
          }

          // Case 2: Only manual verification succeeded
          if (manualVerification.success) {
            console.log('DEBUG auth-test: allowing access with manually verified token')
            return response.ok({
              message: 'Authentication successful (manual verification)',
              method: 'manual',
              user: {
                id: manualVerification.user.id,
                email: manualVerification.user.email,
              },
              token: {
                verified: true,
                manualOnly: true,
                type: manualVerification.tokenInfo.type,
                abilities: manualVerification.tokenInfo.abilities,
              },
              standardAuthError: standardAuth.error,
            })
          }

          // Case 3: Both verification methods failed
          return response.unauthorized({
            message: 'Authentication failed',
            manualVerificationError: manualVerification.error,
            standardAuthError: standardAuth.error,
            tokenLength: token.length,
          })
        })

        // Routes des utilisateurs
        router.get('/users', [UsersController, 'index'])
        router.get('/users/:id', [UsersController, 'show'])
        router.put('/users/:id', [UsersController, 'update'])
        router.delete('/users/:id', [UsersController, 'destroy'])

        // Routes des organisations
        router.post('/organizations', [OrganizationsController, 'store'])
        router.get('/organizations', [OrganizationsController, 'index'])
        router.get('/organizations/:id', [OrganizationsController, 'show'])
        router.put('/organizations/:id', [OrganizationsController, 'update'])
        router.delete('/organizations/:id', [OrganizationsController, 'destroy'])

        // Routes des projets
        router.post('/projects', [ProjectsController, 'store'])
        router.get('/projects', [ProjectsController, 'index'])
        router.get('/projects/:id', [ProjectsController, 'show'])
        router.put('/projects/:id', [ProjectsController, 'update'])
        router.delete('/projects/:id', [ProjectsController, 'destroy'])

        // Routes spécifiques aux projets
        router.post('/projects/:projectId/vectors/upload', [
          ProjectsController,
          'uploadVectorDocument',
        ])
        router.post('/projects/:projectId/vectors/test', [ProjectsController, 'testSupabaseVector'])
        router.post('/projects/:projectId/ask', [ProjectsController, 'ask'])
      })
      .use(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/v1')

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

const AuthController = () => import('#controllers/auth_controller')
const HomeController = () => import('#controllers/home_controller')
const OrganizationsController = () => import('#controllers/organizations_controller')
const ProjectsController = () => import('#controllers/projects_controller')
const UsersController = () => import('#controllers/users_controller')

// Routes publiques (sans préfixe)
router.get('/', [HomeController, 'index'])

// Pages d'authentification (publiques)
router.get('/login', ({ inertia }) => {
  return inertia.render('Login')
})
router.get('/register', ({ inertia }) => {
  return inertia.render('Register')
})
router.get('/signup', ({ inertia }) => {
  return inertia.render('Register')
})
router.get('/signin', ({ inertia }) => {
  return inertia.render('Login')
})

// Routes d'authentification web (session-based)
router.post('/login', [AuthController, 'loginWeb'])
router.post('/register', [AuthController, 'signupWeb'])
router.post('/logout', [AuthController, 'logoutWeb'])

// Pages protégées avec authentification web
router
  .group(() => {
    // Pages d'affichage
    router.get('/projects', [ProjectsController, 'indexPage'])
    router.get('/organizations', [OrganizationsController, 'indexPage'])

    // Pages de création
    router.get('/projects/create', ({ inertia }) => {
      return inertia.render('CreateProject')
    })
    router.get('/organizations/create', ({ inertia }) => {
      return inertia.render('CreateOrganization')
    })
  })
  .use(middleware.webAuth())

// Routes API avec préfixe /v1
router
  .group(() => {
    // Routes publiques API
    router.post('/signup', [AuthController, 'signup'])
    router.post('/signin', [AuthController, 'signin'])

    // Routes protégées
    router
      .group(() => {
        router.post('/logout', [AuthController, 'logout'])

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

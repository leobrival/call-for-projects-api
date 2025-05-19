/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
const OrganizationsController = () => import('#controllers/organizations_controller')
const ProjectsController = () => import('#controllers/projects_controller')
const UsersController = () => import('#controllers/users_controller')

router
  .group(() => {
    router.on('/').render('pages/home')
    router.resource('/users', UsersController)
    router.resource('/organizations', OrganizationsController)
    router.resource('/projects', ProjectsController)
    router.resource('/users', UsersController)

    router.post('/signup', [AuthController, 'signup'])
    router.post('/signin', [AuthController, 'signin'])
    router.post('/logout', [AuthController, 'logout'])

    router.post('/projects/:projectId/vectors/upload', [ProjectsController, 'uploadVectorDocument'])
    router.get('/projects/:projectId/vectors/test', [ProjectsController, 'testSupabaseVector'])
    router.get('/projects/organization/:organizationId', [ProjectsController, 'listByOrganization'])
    router.get('/projects/user/:userId', [ProjectsController, 'listByUser'])
    router.post('/projects/:projectId/ask', [ProjectsController, 'ask'])
  })
  .prefix('/v1')

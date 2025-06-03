import AuthService from '#services/auth_service'
import { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  /**
   * Display the home page with Inertia.js
   */
  async index({ inertia, auth }: HttpContext) {
    const authData = await AuthService.getAuthDataForInertia(auth)

    return inertia.render('Home', {
      message: 'Application configurée avec succès !',
      ...authData,
    })
  }
}

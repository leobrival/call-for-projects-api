import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    const users = await User.all()
    return response.ok(users)
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })
    return response.ok(user)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, auth }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })
    // Optionnel: vérifier que l'utilisateur courant a le droit de modifier
    const { fullName, email, password } = request.only(['fullName', 'email', 'password'])
    if (fullName) user.fullName = fullName
    if (email) user.email = email
    if (password) user.password = password
    await user.save()
    return response.ok(user)
  }

  /**
   * Delete record
   */
  async destroy({ params, response, auth }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })
    // Optionnel: vérifier que l'utilisateur courant a le droit de supprimer
    await user.delete()
    return response.noContent()
  }
}

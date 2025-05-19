import Organization from '#models/organization'
import OrganizationMember from '#models/organization_member'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'

export default class OrganizationMembersController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    const members = await OrganizationMember.all()
    return response.ok(members)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const { organizationId, userId, role } = request.only(['organizationId', 'userId', 'role'])
    if (!organizationId || !userId) {
      return response.unprocessableEntity({ message: 'organizationId and userId are required' })
    }
    const org = await Organization.find(organizationId)
    const user = await User.find(userId)
    if (!org || !user) {
      return response.unprocessableEntity({ message: 'Organization or user not found' })
    }
    const invitationToken = randomUUID()
    const member = await OrganizationMember.create({
      organizationId,
      userId,
      role: role || 'member',
      invitationStatus: 'pending',
      invitationToken,
    })
    return response.created(member)
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const member = await OrganizationMember.find(params.id)
    if (!member) return response.notFound({ message: 'Not found' })
    return response.ok(member)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext) {
    const member = await OrganizationMember.find(params.id)
    if (!member) return response.notFound({ message: 'Not found' })
    const { role, invitationStatus } = request.only(['role', 'invitationStatus'])
    if (role) member.role = role
    if (invitationStatus) member.invitationStatus = invitationStatus
    await member.save()
    return response.ok(member)
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const member = await OrganizationMember.find(params.id)
    if (!member) return response.notFound({ message: 'Not found' })
    await member.delete()
    return response.noContent()
  }
}

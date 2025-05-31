import OrganizationMember from '#models/organization_member'
import Factory from '@adonisjs/lucid/factories'
import { OrganizationFactory } from './organization_factory.js'
import { UserFactory } from './user_factory.js'

export const OrganizationMemberFactory = Factory.define(OrganizationMember, async ({ faker }) => {
  // Créer des entités liées par défaut (peuvent être surchargées)
  const organization = await OrganizationFactory.create()
  const user = await UserFactory.create()

  return {
    organizationId: organization.id,
    userId: user.id,
    role: faker.helpers.arrayElement(['admin', 'member']),
    invitationStatus: faker.helpers.arrayElement(['pending', 'accepted', 'declined']),
    invitationToken: faker.datatype.boolean() ? faker.string.uuid() : null,
  }
}).build()

import OrganizationMember from '#models/organization_member'
import Factory from '@adonisjs/lucid/factories'

export const OrganizationMemberFactory = Factory.define(OrganizationMember, async ({ faker }) => ({
  organizationId: faker.string.uuid(),
  userId: faker.string.uuid(),
  role: faker.helpers.arrayElement(['admin', 'member']),
  invitationStatus: faker.helpers.arrayElement(['pending', 'accepted', 'declined']),
  invitationToken: faker.string.uuid(),
})).build()

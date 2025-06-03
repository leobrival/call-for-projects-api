import { OrganizationFactory } from '#database/factories/organization_factory'
import { OrganizationMemberFactory } from '#database/factories/organization_member_factory'
import { UserFactory } from '#database/factories/user_factory'
import Organization from '#models/organization'
import OrganizationMember from '#models/organization_member'
import User from '#models/user'
import { test } from '@japa/runner'

test.group('Organization', (group) => {
  group.each.teardown(async () => {
    // Clean in dependency order
    await OrganizationMember.query().delete()
    await Organization.query().delete()
    await User.query().delete()
  })

  test('Organization factory creates valid organization', async ({ assert }) => {
    const org = await OrganizationFactory.create()

    assert.isString(org.id)
    assert.isString(org.name)
    assert.isString(org.slug)
    assert.isDefined(org.createdAt)
    assert.isDefined(org.updatedAt)
  })

  test('Organization slug is unique', async ({ assert }) => {
    const org1 = await OrganizationFactory.create()
    const org2 = await OrganizationFactory.create()

    assert.notEqual(org1.slug, org2.slug)
  })

  test('Organization has correct relationships', async ({ assert }) => {
    const user = await UserFactory.create()
    const org = await OrganizationFactory.create()

    // Test many-to-many relationship with users by creating an OrganizationMember
    await OrganizationMemberFactory.merge({
      organizationId: org.id,
      userId: user.id,
      role: 'member',
      invitationStatus: 'accepted',
    }).create()

    await org.load('users')

    assert.equal(org.users.length, 1)
    assert.equal(org.users[0].id, user.id)
  })

  test('Organization can have projects', async ({ assert }) => {
    const org = await OrganizationFactory.create()
    await org.load('projects')

    assert.isArray(org.projects)
  })
})

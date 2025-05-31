import { OrganizationFactory } from '#database/factories/organization_factory'
import { OrganizationMemberFactory } from '#database/factories/organization_member_factory'
import { UserFactory } from '#database/factories/user_factory'
import Organization from '#models/organization'
import OrganizationMember from '#models/organization_member'
import User from '#models/user'
import { test } from '@japa/runner'

test.group('OrganizationMember', (group) => {
  group.each.teardown(async () => {
    // Nettoyer dans l'ordre des dépendances
    await OrganizationMember.query().delete()
    await Organization.query().delete()
    await User.query().delete()
  })

  test('OrganizationMember factory creates valid member', async ({ assert }) => {
    const member = await OrganizationMemberFactory.create()

    assert.isString(member.id)
    assert.isString(member.organizationId)
    assert.isString(member.userId)
    assert.isString(member.role)
    assert.isString(member.invitationStatus)
    assert.isDefined(member.createdAt)
    assert.isDefined(member.updatedAt)

    // Vérifier que les relations existent
    const orgExists = await Organization.find(member.organizationId)
    const userExists = await User.find(member.userId)

    assert.isNotNull(orgExists)
    assert.isNotNull(userExists)
  })

  test('OrganizationMember with specific role and status', async ({ assert }) => {
    const org = await OrganizationFactory.create()
    const user = await UserFactory.create()

    const member = await OrganizationMemberFactory.merge({
      organizationId: org.id,
      userId: user.id,
      role: 'admin',
      invitationStatus: 'accepted',
    }).create()

    assert.equal(member.role, 'admin')
    assert.equal(member.invitationStatus, 'accepted')
    assert.equal(member.organizationId, org.id)
    assert.equal(member.userId, user.id)
  })

  test('OrganizationMember role validation', async ({ assert }) => {
    const member = await OrganizationMemberFactory.create()

    // Vérifier que le rôle est valide
    assert.isTrue(['admin', 'member'].includes(member.role))
  })

  test('OrganizationMember invitation status validation', async ({ assert }) => {
    const member = await OrganizationMemberFactory.create()

    // Vérifier que le statut d'invitation est valide
    assert.isTrue(['pending', 'accepted', 'declined'].includes(member.invitationStatus))
  })

  test('Multiple members can belong to same organization', async ({ assert }) => {
    const org = await OrganizationFactory.create()
    const user1 = await UserFactory.create()
    const user2 = await UserFactory.create()

    const member1 = await OrganizationMemberFactory.merge({
      organizationId: org.id,
      userId: user1.id,
    }).create()

    const member2 = await OrganizationMemberFactory.merge({
      organizationId: org.id,
      userId: user2.id,
    }).create()

    assert.equal(member1.organizationId, org.id)
    assert.equal(member2.organizationId, org.id)
    assert.notEqual(member1.userId, member2.userId)
  })

  test('Same user can be member of multiple organizations', async ({ assert }) => {
    const org1 = await OrganizationFactory.create()
    const org2 = await OrganizationFactory.create()
    const user = await UserFactory.create()

    const member1 = await OrganizationMemberFactory.merge({
      organizationId: org1.id,
      userId: user.id,
    }).create()

    const member2 = await OrganizationMemberFactory.merge({
      organizationId: org2.id,
      userId: user.id,
    }).create()

    assert.equal(member1.userId, user.id)
    assert.equal(member2.userId, user.id)
    assert.notEqual(member1.organizationId, member2.organizationId)
  })
})

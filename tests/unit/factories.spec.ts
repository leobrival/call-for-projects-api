import { OrganizationFactory } from '#database/factories/organization_factory'
import { OrganizationMemberFactory } from '#database/factories/organization_member_factory'
import { ProjectFactory } from '#database/factories/project_factory'
import { UserFactory } from '#database/factories/user_factory'
import Organization from '#models/organization'
import OrganizationMember from '#models/organization_member'
import Project from '#models/project'
import User from '#models/user'
import { test } from '@japa/runner'

test.group('Factories', (group) => {
  group.each.teardown(async () => {
    // Nettoyer dans l'ordre des dépendances
    await Project.query().delete()
    await OrganizationMember.query().delete()
    await Organization.query().delete()
    await User.query().delete()
  })

  test('UserFactory creates valid user', async ({ assert }) => {
    const user = await UserFactory.create()

    assert.isString(user.id)
    assert.isString(user.email)
    assert.isString(user.password)
    assert.isDefined(user.createdAt)
    assert.isDefined(user.updatedAt)
  })

  test('OrganizationFactory creates valid organization', async ({ assert }) => {
    const org = await OrganizationFactory.create()

    assert.isString(org.id)
    assert.isString(org.name)
    assert.isString(org.slug)
    assert.isDefined(org.createdAt)
    assert.isDefined(org.updatedAt)
  })

  test('ProjectFactory creates valid project with relations', async ({ assert }) => {
    const project = await ProjectFactory.create()

    assert.isString(project.id)
    assert.isString(project.name)
    assert.isString(project.organizationId)
    assert.isString(project.createdBy)
    assert.isDefined(project.createdAt)
    assert.isDefined(project.updatedAt)

    // Vérifier que les relations existent
    const orgExists = await Organization.find(project.organizationId)
    const userExists = await User.find(project.createdBy)

    assert.isNotNull(orgExists)
    assert.isNotNull(userExists)
  })

  test('OrganizationMemberFactory creates valid member with relations', async ({ assert }) => {
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

  test('Factory merge works correctly', async ({ assert }) => {
    const org = await OrganizationFactory.create()
    const user = await UserFactory.create()

    const project = await ProjectFactory.merge({
      name: 'Test Project',
      organizationId: org.id,
      createdBy: user.id,
    }).create()

    assert.equal(project.name, 'Test Project')
    assert.equal(project.organizationId, org.id)
    assert.equal(project.createdBy, user.id)
  })

  test('Multiple organizations have unique slugs', async ({ assert }) => {
    const org1 = await OrganizationFactory.create()
    const org2 = await OrganizationFactory.create()

    assert.notEqual(org1.slug, org2.slug)
  })
})

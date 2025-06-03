import { OrganizationFactory } from '#database/factories/organization_factory'
import { ProjectFactory } from '#database/factories/project_factory'
import { UserFactory } from '#database/factories/user_factory'
import Organization from '#models/organization'
import Project from '#models/project'
import User from '#models/user'
import { test } from '@japa/runner'

test.group('Project', (group) => {
  group.each.teardown(async () => {
    // Clean in dependency order
    await Project.query().delete()
    await Organization.query().delete()
    await User.query().delete()
  })

  test('Project factory creates valid project', async ({ assert }) => {
    const project = await ProjectFactory.create()

    assert.isString(project.id)
    assert.isString(project.name)
    assert.isString(project.organizationId)
    assert.isString(project.createdBy)
    assert.isDefined(project.createdAt)
    assert.isDefined(project.updatedAt)

    // Verify that relationships exist
    const orgExists = await Organization.find(project.organizationId)
    const userExists = await User.find(project.createdBy)

    assert.isNotNull(orgExists)
    assert.isNotNull(userExists)
  })

  test('Project belongs to organization', async ({ assert }) => {
    const org = await OrganizationFactory.create()
    const user = await UserFactory.create()

    const project = await ProjectFactory.merge({
      organizationId: org.id,
      createdBy: user.id,
    }).create()

    await project.load('organization')

    assert.equal(project.organizationId, org.id)
    assert.equal(project.organization.id, org.id)
    assert.equal(project.organization.name, org.name)
  })

  test('Project with specific values', async ({ assert }) => {
    const org = await OrganizationFactory.create()
    const user = await UserFactory.create()

    const project = await ProjectFactory.merge({
      name: 'Custom Project',
      description: 'Custom description',
      organizationId: org.id,
      createdBy: user.id,
    }).create()

    assert.equal(project.name, 'Custom Project')
    assert.equal(project.description, 'Custom description')
    assert.equal(project.organizationId, org.id)
    assert.equal(project.createdBy, user.id)
  })

  test('Multiple projects can belong to same organization', async ({ assert }) => {
    const org = await OrganizationFactory.create()
    const user = await UserFactory.create()

    const project1 = await ProjectFactory.merge({
      organizationId: org.id,
      createdBy: user.id,
    }).create()

    const project2 = await ProjectFactory.merge({
      organizationId: org.id,
      createdBy: user.id,
    }).create()

    assert.equal(project1.organizationId, org.id)
    assert.equal(project2.organizationId, org.id)
    assert.notEqual(project1.id, project2.id)
  })
})

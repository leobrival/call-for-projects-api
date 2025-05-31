import Project from '#models/project'
import Factory from '@adonisjs/lucid/factories'
import { OrganizationFactory } from './organization_factory.js'
import { UserFactory } from './user_factory.js'

export const ProjectFactory = Factory.define(Project, async ({ faker }) => {
  // Créer des entités liées par défaut (peuvent être surchargées)
  const organization = await OrganizationFactory.create()
  const user = await UserFactory.create()

  return {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    organizationId: organization.id,
    createdBy: user.id,
  }
}).build()

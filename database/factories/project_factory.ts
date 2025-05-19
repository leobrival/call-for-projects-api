import Project from '#models/project'
import Factory from '@adonisjs/lucid/factories'

export const ProjectFactory = Factory.define(Project, async ({ faker }) => ({
  name: faker.commerce.productName(),
  description: faker.lorem.sentence(),
  organizationId: faker.string.uuid(), // ou à surcharger dans les tests
  createdBy: faker.string.uuid(), // ou à surcharger dans les tests
})).build()

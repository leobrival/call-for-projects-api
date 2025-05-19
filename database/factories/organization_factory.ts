import Organization from '#models/organization'
import Factory from '@adonisjs/lucid/factories'

export const OrganizationFactory = Factory.define(Organization, async ({ faker }) => ({
  name: faker.company.name(),
  slug: faker.helpers.slugify(faker.company.name()),
})).build()

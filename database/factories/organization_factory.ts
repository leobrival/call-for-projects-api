import Organization from '#models/organization'
import Factory from '@adonisjs/lucid/factories'

export const OrganizationFactory = Factory.define(Organization, async ({ faker }) => {
  const name = faker.company.name()
  const timestamp = Date.now()
  const random = faker.string.alphanumeric(4)

  return {
    name: `${name} ${random}`,
    slug: faker.helpers.slugify(`${name}-${timestamp}-${random}`).toLowerCase(),
  }
}).build()

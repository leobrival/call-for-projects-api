import User from '#models/user'
import factory from '@adonisjs/lucid/factories'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      email: faker.internet.email(),
      password: 'password', // Use a static password or hash if needed
      fullName: faker.person.fullName(),
      // Add other fields as needed, e.g.:
      // isActive: faker.datatype.boolean(),
      // createdAt: faker.date.past(),
    }
  })
  .build()

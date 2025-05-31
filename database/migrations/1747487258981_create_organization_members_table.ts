import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_members'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('id')
        .primary()
        .notNullable()
        .defaultTo(this.db.rawQuery('uuid_generate_v4()').knexQuery)
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE')
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('role').notNullable().defaultTo('member')
      table.string('invitation_status').notNullable().defaultTo('pending')
      table.string('invitation_token').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

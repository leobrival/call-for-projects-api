import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Projects extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').exec()

    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('id')
        .primary()
        .notNullable()
        .defaultTo(this.db.rawQuery('uuid_generate_v4()').knexQuery)
      table.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('description').nullable()
      table.uuid('created_by').references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

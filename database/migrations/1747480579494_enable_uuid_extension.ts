import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  public async up() {
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').exec()
  }

  public async down() {
    await this.db.rawQuery('DROP EXTENSION IF EXISTS "uuid-ossp"').exec()
  }
}

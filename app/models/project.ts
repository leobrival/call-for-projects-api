import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import Organization from './organization.js'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'organization_id' })
  declare organizationId: string

  @belongsTo(() => Organization)
  declare organization: any

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column({ columnName: 'created_by' })
  declare createdBy: string

  public static boot() {
    super.boot()
    this.before('create', (project) => {
      if (!project.id) project.id = uuidv4()
    })
  }
}

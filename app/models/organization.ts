import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import Project from './project.js'
import User from './user.js'

export default class Organization extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Project)
  declare projects: any

  @manyToMany(() => User, {
    pivotTable: 'organization_members',
    pivotForeignKey: 'organization_id',
    pivotRelatedForeignKey: 'user_id',
    pivotColumns: ['role', 'invitation_status', 'invitation_token'],
  })
  declare users: any

  public static boot() {
    super.boot()
    this.before('create', (org) => {
      if (!org.id) org.id = uuidv4()
    })
  }
}

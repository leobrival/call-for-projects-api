import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class OrganizationMember extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare organizationId: string

  @column()
  declare userId: string

  @column()
  declare role: string

  @column()
  declare invitationStatus: string

  @column()
  declare invitationToken: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  public static boot() {
    super.boot()
    this.before('create', (member) => {
      if (!member.id) member.id = uuidv4()
    })
  }
}

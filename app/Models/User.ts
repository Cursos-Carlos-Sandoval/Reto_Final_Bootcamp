import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import TypesDocument from './TypesDocument'
import Role from './Role'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @column()
  public first_name: string
  @column()
  public second_name: string
  @column()
  public surname: string
  @column()
  public second_sur_name: string
  @column()
  public type_document: number
  @column()
  public document_number: string
  @column()
  public email: string
  @column()
  public password: string
  @column()
  public rol_id: number
  @column()
  public phone: string
  @column()
  public state: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => TypesDocument, {
    localKey: 'id',
    foreignKey: 'type_document',
  })
  public typeDoc: BelongsTo<typeof TypesDocument>
  @belongsTo(() => Role, {
    localKey: 'id',
    foreignKey: 'rol_id',
  })
  public role: BelongsTo<typeof Role>
}

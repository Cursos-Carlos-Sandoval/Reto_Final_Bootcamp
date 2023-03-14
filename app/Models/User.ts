import { DateTime } from 'luxon'
import { BaseModel, HasOne, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
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
  @hasOne(() => TypesDocument)
  public document_number: HasOne<typeof TypesDocument>
  @column()
  public email: string
  @column()
  public password: string
  @hasOne(() => Role)
  public rol_id: HasOne<typeof Role>
  @column()
  public phone: string
  @column()
  public state: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

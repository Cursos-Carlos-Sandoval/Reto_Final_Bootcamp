import { DateTime } from 'luxon'
import { BaseModel, HasOne, column, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Answer from './Answer'

export default class Form extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @hasOne(() => User)
  public student_id: HasOne<typeof User>
  @hasOne(() => Answer)
  public answer_id: HasOne<typeof Answer>
  @column()
  public state: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

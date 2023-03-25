import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Answer from './Answer'

export default class Form extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @column()
  public student_id: number
  @column()
  public answer_id: number
  @column()
  public state: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'student_id',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Answer, {
    localKey: 'id',
    foreignKey: 'answer_id',
  })
  public answer: BelongsTo<typeof Answer>
}

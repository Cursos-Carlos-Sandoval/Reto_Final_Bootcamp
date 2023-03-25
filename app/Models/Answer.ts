import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Question from './Question'

export default class Answer extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @column()
  public answer: string
  @column()
  public is_correct: boolean
  @column()
  public question_id: number
  @column()
  public state: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Question, {
    localKey: 'id',
    foreignKey: 'question_id',
  })
  public question: BelongsTo<typeof Question>
}

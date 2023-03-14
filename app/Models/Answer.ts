import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Question from './Question'

export default class Answer extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @column()
  public answer: string
  @column()
  public is_correct: boolean
  @hasOne(() => Question)
  public question_id: HasOne<typeof Question>
  @column()
  public state: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

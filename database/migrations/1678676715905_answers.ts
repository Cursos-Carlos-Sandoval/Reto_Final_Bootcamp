import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'answers'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('answer', 180).notNullable()
      table.boolean('is_correct').notNullable()
      table.integer('question_id').notNullable()
      table.boolean('state').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.alterTable('answers', (table) => {
      table.foreign('question_id').references('questions.id')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

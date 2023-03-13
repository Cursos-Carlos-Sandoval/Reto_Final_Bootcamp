import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'forms'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('student_id').notNullable()
      table.integer('answer_id').notNullable()
      table.boolean('state').notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.alterTable('forms', (table) => {
      table.foreign('student_id').references('users.id')
      table.foreign('answer_id').references('answers.id')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

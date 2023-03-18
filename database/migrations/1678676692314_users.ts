import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('first_name', 180).notNullable()
      table.string('second_name', 180).notNullable()
      table.string('surname', 180).notNullable()
      table.string('second_sur_name', 180).notNullable()
      table.integer('type_document').notNullable()
      table.integer('document_number').notNullable().unsigned()
      table.string('email', 180).notNullable().unique()
      table.string('password', 180).notNullable()
      table.integer('rol_id').notNullable().unsigned()
      table.string('phone', 180).notNullable()
      table.boolean('state').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.alterTable('users', (table) => {
      table.foreign('type_document').references('types_documents.id')
      table.foreign('rol_id').references('roles.id')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

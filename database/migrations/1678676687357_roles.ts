import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'roles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 180).notNullable()
      table.boolean('state').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.defer(async () => {
      await this.db.table(this.tableName).insert([
        { name: 'Admin', created_at: new Date(), updated_at: new Date() },
        { name: 'Student', created_at: new Date(), updated_at: new Date() },
      ])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

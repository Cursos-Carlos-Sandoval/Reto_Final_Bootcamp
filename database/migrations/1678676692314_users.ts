import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import bcryptjs from 'bcryptjs'

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
      table.string('document_number', 180).notNullable().unsigned().unique()
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

    this.defer(async () => {
      await this.db.table(this.tableName).insert([
        {
          first_name: 'Admin',
          second_name: 'Admin',
          surname: 'Admin',
          second_sur_name: 'Admin',
          type_document: 1,
          document_number: 123456789,
          email: 'admin@example.com',
          password: bcryptjs.hashSync('123456', bcryptjs.genSaltSync()),
          rol_id: 1,
          phone: '123456789',
        },
        {
          first_name: 'Test',
          second_name: 'User',
          surname: 'Test',
          second_sur_name: 'User',
          type_document: 1,
          document_number: 100000000,
          email: 'test@test.com',
          password: bcryptjs.hashSync('testExecute', bcryptjs.genSaltSync()),
          rol_id: 2,
          phone: '100000000',
        },
        {
          first_name: 'Estudiante',
          second_name: 'Estudiante',
          surname: 'Estudiante',
          second_sur_name: 'Estudiante',
          type_document: 1,
          document_number: 120112013,
          email: 'estudiante@example.com',
          password: bcryptjs.hashSync('123456', bcryptjs.genSaltSync()),
          rol_id: 2,
          phone: '120112010',
        },
        {
          first_name: 'Eliminado',
          second_name: 'Eliminado',
          surname: 'Eliminado',
          second_sur_name: 'Eliminado',
          type_document: 1,
          document_number: 120112113,
          email: 'eliminado@example.com',
          password: bcryptjs.hashSync('123456', bcryptjs.genSaltSync()),
          rol_id: 1,
          phone: '120112010',
          state: false,
        },
      ])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

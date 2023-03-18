import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from '../../Models/Role'
import Database from '@ioc:Adonis/Lucid/Database'

export default class RolesController {
  public async register({ request, response }: HttpContextContract) {
    const trx = await Database.transaction()
    try {
      const { name } = request.all()
      const role = new Role()
      role.name = name

      await role.save()
      await trx.commit()

      response.status(200).json({ status: true, message: 'Rol creado correctamente' })
    } catch (error) {
      await trx.rollback()
      console.error(error)

      response.status(400).json({ status: false, message: 'Fallo en la creación del rol' })
    }
  }

  public async getAll(): Promise<Role[]> {
    return await Role.all()
  }
}

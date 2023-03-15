import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from '../../Models/Role'

export default class RolesController {
  public async register({ request, response }: HttpContextContract) {
    const { name } = request.all()
    const role = new Role()
    role.name = name

    await role.save()
    return response.status(200).json({ role, msg: 'Role registered' })
  }

  public async getAllTypesDocuments(): Promise<Role[]> {
    return await Role.all()
  }
}

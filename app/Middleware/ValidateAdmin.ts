import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UsersController from '../Controllers/Http/UsersController'

export default class ValidateAdmin {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const authorizationHeader: string = ctx.request.header('authorization') ?? ''

    const payload = UsersController.getTokenPayload(authorizationHeader)
    const data = { rolId: payload?.rol_id, state: payload?.state }

    if (data.rolId !== 1 || data.state === false) {
      return ctx.response.status(404).json({
        state: false,
        message: 'Sitio no encontrado',
      })
    }
    await next()
  }
}

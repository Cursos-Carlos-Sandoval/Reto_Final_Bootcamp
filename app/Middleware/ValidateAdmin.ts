import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UsersController from '../Controllers/Http/UsersController'
import User from '../Models/User'

export default class ValidateAdmin {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const authorizationHeader: string | undefined = ctx.request.header('authorization')

    const { id } = UsersController.getTokenPayload(authorizationHeader ?? '')
    const user = await User.find(id)

    if (!user || user === null) {
      ctx.response.status(400).json({
        message: 'Invalid token',
      })
    }

    if (user?.rol_id !== 1) {
      return ctx.response.status(404).json({
        state: false,
        message: 'Not found',
      })
    }
    await next()
  }
}

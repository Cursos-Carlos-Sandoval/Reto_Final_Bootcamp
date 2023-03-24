import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UsersController from '../Controllers/Http/UsersController'
import User from '../Models/User'

export default class ValidateAdmin {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const authorizationHeader: string | undefined = ctx.request.header('authorization')

    try {
      const { id } = UsersController.getTokenPayload(authorizationHeader ?? '')
      const user = await User.findOrFail(id)

      if (!user) {
        return ctx.response.status(401).json({
          message: 'Invalid token',
        })
      }

      if (user.rol_id !== 1) {
        return ctx.response.status(404).json({
          message: 'Not found',
        })
      }
      await next()
    } catch (error) {
      console.error(error)
      ctx.response.status(400).json({
        message: 'Invalid token',
      })
    }
  }
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UsersController from '../Controllers/Http/UsersController'
import User from '../Models/User'

export default class AuthJwt {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const authorizationHeader = ctx.request.header('authorization')

    if (authorizationHeader === undefined) {
      return ctx.response.status(404).send({
        state: false,
        message: 'Sitio no encontrado',
      })
    }

    try {
      UsersController.verifyToken(authorizationHeader)

      const { id } = UsersController.getTokenPayload(authorizationHeader)
      await User.query().where('id', id).andWhere('state', true).firstOrFail()

      await next()
    } catch (error) {
      console.log(error)
      ctx.response.status(404).send({ state: false, message: 'Token fail' })
    }
  }
}

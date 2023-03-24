import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UsersController from '../Controllers/Http/UsersController'

export default class AuthJwt {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const authorizationHeader = ctx.request.header('authorization')

    if (authorizationHeader === undefined) {
      return ctx.response.status(404).send({
        state: false,
        message: 'Not found',
      })
    }

    try {
      UsersController.verifyToken(authorizationHeader)
      await next()
    } catch (error) {
      console.log(error)
      ctx.response.status(401).send({ state: false, message: 'Token fail' })
    }
  }
}

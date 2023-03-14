import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt, { JwtPayload } from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import bcrypt from 'bcryptjs'
import User from '../../Models/User'

export default class UsersController {
  public static getTokenFromHeader(authorizationHeader: string): string {
    return authorizationHeader.split(' ')[1]
  }

  public static verifyToken(authorizationHeader: string): void {
    const token = UsersController.getTokenFromHeader(authorizationHeader)
    jwt.verify(token, Env.get('JWT_SECRET_KEY'), (error: any) => {
      if (error) {
        throw new Error('Expired token')
      }
    })
  }

  public static getTokenPayload(authorizationHeader: string): JwtPayload | string {
    const token = UsersController.getTokenFromHeader(authorizationHeader)
    return jwt.verify(token, Env.get('JWT_SECRET_KEY'), { complete: true }).payload
  }

  private static createUser(dataRequest: any) {
    const {
      firstName,
      secondName,
      surname,
      secondSurName,
      typeDocument,
      documentNumber,
      email,
      password,
      rolId,
      phone,
      state,
    } = dataRequest

    const user = new User()
    user.first_name = firstName
    user.second_name = secondName
    user.surname = surname
    user.second_sur_name = secondSurName
    user.type_document = typeDocument
    user.document_number = documentNumber
    user.email = email
    user.password = password
    user.rol_id = rolId
    user.phone = phone
    user.state = state

    return user
  }

  public async register({ request, response }: HttpContextContract) {
    const user = UsersController.createUser(request.all())
    await user.save()

    return response.status(200).json({ user, msg: 'Registered user' })
  }
}

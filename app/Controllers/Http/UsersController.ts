import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt, { JwtPayload } from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import bcryptjs from 'bcryptjs'
import User from '../../Models/User'

export default class UsersController {
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

  private static async getUserByEmail(email: string): Promise<User | null> {
    return await User.findBy('email', email)
  }

  private static isValidPassword(password: string, user: User | null): boolean {
    if (user === null) return false
    return bcryptjs.compareSync(password, user.password)
  }

  private static createToken(payload: any): string {
    const options = {
      expiresIn: '60 mins',
    }
    return jwt.sign(payload, Env.get('JWT_SECRET_KEY'), options)
  }

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

  public async register({ request, response }: HttpContextContract) {
    const user = UsersController.createUser(request.all())
    await user.save()

    return response.status(200).json({ user, msg: 'Registered user' })
  }

  public async login({ request, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    try {
      const user = await UsersController.getUserByEmail(email)
      if (!user) return response.status(400).json({ msg: 'Invalid credentials' })

      if (!UsersController.isValidPassword(password, user))
        return response.status(400).json({ msg: 'Invalid credentials' })

      const payload = {
        id: user.id,
        type_document: user.type_document,
        document_number: user.document_number,
        rol_id: user.rol_id,
        state: user.state,
      }

      const token: string = UsersController.createToken(payload)
      response.status(200).json({
        token,
        msg: 'User login',
      })
    } catch (error) {
      console.error(error)
      response.json({ msg: 'Invalid credentials' })
    }
  }
}

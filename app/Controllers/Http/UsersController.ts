import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt, { JwtPayload } from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import bcryptjs from 'bcryptjs'
import User from '../../Models/User'
import Role from '../../Models/Role'
import Database from '@ioc:Adonis/Lucid/Database'
import TypesDocument from '../../Models/TypesDocument'

export default class UsersController {
  private static async createUser(dataRequest: any, role_id: number) {
    const trx = await Database.transaction()

    try {
      const {
        firstName,
        secondName,
        surname,
        secondSurName,
        typeDocument,
        documentNumber,
        email,
        password,
        phone,
      } = dataRequest

      // User info
      const user = new User()
      user.first_name = firstName
      user.second_name = secondName
      user.surname = surname
      user.second_sur_name = secondSurName
      user.document_number = documentNumber
      user.email = email
      user.password = password
      user.phone = phone

      // Relation with role
      const role = await Role.findByOrFail('id', role_id)
      User.$getRelation('rol_id').setRelated(user, role)

      // Relation with Type Document
      const tp = await TypesDocument.findByOrFail('id', typeDocument)
      User.$getRelation('type_document').setRelated(user, tp)

      await user.save()
      await trx.commit()
    } catch (error) {
      console.error(error)
      await trx.rollback()
    }
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

  public async registerStudent({ request, response }: HttpContextContract) {
    try {
      await UsersController.createUser(request.all(), 2)

      response.status(200).json({ state: true, message: 'Estudiante creado correctamente' })
    } catch (error) {
      response.status(400).json({ state: false, message: 'Fallo en la creación del estudiante' })
    }
  }

  public async login({ request, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    try {
      const user = await UsersController.getUserByEmail(email)
      if (!user)
        return response.status(400).json({ state: false, message: 'contraseña o email invalido ' })

      if (!UsersController.isValidPassword(password, user))
        return response.status(400).json({ state: false, message: 'contraseña o email invalido ' })

      const payload = {
        id: user.id,
        type_document: user.type_document,
        document_number: user.document_number,
        rol_id: user.rol_id,
        state: user.state,
      }

      const token: string = UsersController.createToken(payload)
      response.status(200).json({
        state: true,
        id: user.id,
        name: `${user.first_name} ${user.second_name} ${user.surname} ${user.second_sur_name}`,
        role: `${user.rol_id.name}`,
        token: token,
        message: 'Ingreso exitoso',
      })
    } catch (error) {
      console.error(error)
      response.json({ state: false, message: 'contraseña o email invalido ' })
    }
  }
}

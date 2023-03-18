import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt, { JwtPayload } from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import bcryptjs from 'bcryptjs'
import User from '../../Models/User'
import Database from '@ioc:Adonis/Lucid/Database'

export default class UsersController {
  private static async createUser(dataRequest: any) {
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
        rol,
        phone,
      } = dataRequest

      await User.create({
        first_name: firstName,
        second_name: secondName,
        surname: surname,
        second_sur_name: secondSurName,
        type_document: typeDocument,
        document_number: documentNumber,
        email: email,
        password: password,
        rol_id: rol,
        phone: phone,
      })

      await trx.commit()
    } catch (error) {
      console.error(error)
      await trx.rollback()
      throw new Error('User creation failed')
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

  public async getAllStudents({ request, response }: HttpContextContract) {
    try {
      const { filter } = request.all()
      const perPage = request.input('perPage', 10)
      const page = request.input('page', 1)

      const students = await Database.from('users')
        .where(
          'rol_id',
          Database.from('roles').select('id').where('name', 'student').orWhere('name', 'estudiante')
        ) // get role_id of student
        .andWhere((query) => {
          for (const columnName in filter) {
            query.orWhere(columnName, filter[columnName])
          }
        }) // Add additional filters
        .select(
          'first_name',
          'second_name',
          'surname',
          'second_sur_name',
          'type_document',
          'document_number',
          'email',
          'phone'
        )
        .paginate(page, perPage)

      response
        .status(200)
        .json({ state: true, message: 'Listado de estudiantes', users: [students] })
    } catch (error) {
      console.error(error)
      response.status(400).json({ state: false, message: 'Fallo en el listado de estudiantes' })
    }
  }

  public async registerStudent({ request, response }: HttpContextContract) {
    try {
      await UsersController.createUser(request.all())
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
        role: `${user.role.name}`,
        token: token,
        message: 'Ingreso exitoso',
      })
    } catch (error) {
      console.error(error)
      response.json({ state: false, message: 'contraseña o email invalido ' })
    }
  }
}
